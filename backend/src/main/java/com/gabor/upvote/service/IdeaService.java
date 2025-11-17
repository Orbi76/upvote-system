package com.gabor.upvote.service;

        import com.gabor.upvote.model.Idea;
        import com.gabor.upvote.model.VoteRecord;
        import com.gabor.upvote.repository.IdeaRepository;
        import com.gabor.upvote.repository.VoteRecordRepository;
        import org.springframework.stereotype.Service;
        import org.springframework.transaction.annotation.Transactional;

        import java.util.List;
        import java.util.NoSuchElementException;
        import java.util.Optional;

@Service
public class IdeaService {

    private final IdeaRepository ideaRepository;
    private final VoteRecordRepository voteRecordRepository;

    public IdeaService(IdeaRepository ideaRepository, VoteRecordRepository voteRecordRepository) {
        this.ideaRepository = ideaRepository;
        this.voteRecordRepository = voteRecordRepository;
    }

    public Idea submitIdea(Idea idea) {
        idea.setApproved(false);
        idea.setVotes(0);
        return ideaRepository.save(idea);
    }

    public List<Idea> listApprovedIdeas() {
        return ideaRepository.findByApprovedTrueOrderByVotesDescCreatedAtDesc();
    }

    public List<Idea> listPendingIdeas() {
        return ideaRepository.findByApprovedFalseOrderByCreatedAtDesc();
    }

    @Transactional
    public Idea approveIdea(Long ideaId) {
        Idea idea = ideaRepository.findById(ideaId).orElseThrow(() -> new NoSuchElementException("Idea not found"));
        idea.setApproved(true);
        return ideaRepository.save(idea);
    }

    @Transactional
    public void rejectIdea(Long ideaId) {
        ideaRepository.deleteById(ideaId);
    }

    @Transactional
    public Idea vote(Long ideaId, String username, String sessionId) {  // ⬅️ username paraméter hozzáadva!
        // Ellenőrizzük, hogy ez a USER szavazott-e már
        if (voteRecordRepository.existsByUsername(username)) {
            Optional<VoteRecord> existingVote = voteRecordRepository.findByUsername(username);
            if (existingVote.isPresent()) {
                Idea votedIdea = ideaRepository.findById(existingVote.get().getIdeaId())
                        .orElse(null);
                String votedTitle = votedIdea != null ? votedIdea.getTitle() : "ismeretlen ötlet";
                throw new IllegalStateException("Már szavaztál erre az ötletre: " + votedTitle);
            }
            throw new IllegalStateException("Már leadtad a szavazatodat");
        }

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new NoSuchElementException("Idea not found"));

        if (!idea.isApproved()) {
            throw new IllegalStateException("Ez az ötlet még nincs jóváhagyva");
        }

        VoteRecord record = new VoteRecord(ideaId, username, sessionId);  // ⬅️ username hozzáadva!
        voteRecordRepository.save(record);

        idea.setVotes(idea.getVotes() + 1);
        return ideaRepository.save(idea);
    }

    public long votesForIdea(Long ideaId) {
        return voteRecordRepository.countByIdeaId(ideaId);
    }
}
