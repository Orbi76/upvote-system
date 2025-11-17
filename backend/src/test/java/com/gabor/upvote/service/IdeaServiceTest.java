package com.gabor.upvote.service;

import com.gabor.upvote.model.Idea;
import com.gabor.upvote.model.VoteRecord;
import com.gabor.upvote.repository.IdeaRepository;
import com.gabor.upvote.repository.VoteRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdeaServiceTest {

    @Mock
    private IdeaRepository ideaRepository;

    @Mock
    private VoteRecordRepository voteRecordRepository;

    @InjectMocks
    private IdeaService ideaService;

    private Idea testIdea;

    @BeforeEach
    void setUp() {
        testIdea = new Idea("Test Idea", "Test Description");
        testIdea.setId(1L);
    }

    @Test
    void shouldSubmitIdea() {
        when(ideaRepository.save(any(Idea.class))).thenReturn(testIdea);

        Idea result = ideaService.submitIdea(testIdea);

        assertNotNull(result);
        assertFalse(result.isApproved());
        assertEquals(0, result.getVotes());
        verify(ideaRepository, times(1)).save(any(Idea.class));
    }

    @Test
    void shouldListApprovedIdeas() {
        Idea approved1 = new Idea("Approved 1", "Desc");
        approved1.setApproved(true);
        Idea approved2 = new Idea("Approved 2", "Desc");
        approved2.setApproved(true);

        when(ideaRepository.findByApprovedTrueOrderByVotesDescCreatedAtDesc())
                .thenReturn(List.of(approved1, approved2));

        List<Idea> result = ideaService.listApprovedIdeas();

        assertEquals(2, result.size());
        assertTrue(result.get(0).isApproved());
        verify(ideaRepository, times(1)).findByApprovedTrueOrderByVotesDescCreatedAtDesc();
    }

    @Test
    void shouldListPendingIdeas() {
        Idea pending1 = new Idea("Pending 1", "Desc");
        pending1.setApproved(false);
        Idea pending2 = new Idea("Pending 2", "Desc");
        pending2.setApproved(false);

        when(ideaRepository.findByApprovedFalseOrderByCreatedAtDesc())
                .thenReturn(List.of(pending1, pending2));

        List<Idea> result = ideaService.listPendingIdeas();

        assertEquals(2, result.size());
        assertFalse(result.get(0).isApproved());
        verify(ideaRepository, times(1)).findByApprovedFalseOrderByCreatedAtDesc();
    }

    @Test
    void shouldApproveIdea() {
        testIdea.setApproved(false);
        when(ideaRepository.findById(1L)).thenReturn(Optional.of(testIdea));
        when(ideaRepository.save(any(Idea.class))).thenReturn(testIdea);

        Idea result = ideaService.approveIdea(1L);

        assertTrue(result.isApproved());
        verify(ideaRepository, times(1)).findById(1L);
        verify(ideaRepository, times(1)).save(testIdea);
    }

    @Test
    void shouldThrowExceptionWhenApprovingNonExistentIdea() {
        when(ideaRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> ideaService.approveIdea(999L));
        verify(ideaRepository, times(1)).findById(999L);
        verify(ideaRepository, never()).save(any(Idea.class));
    }

    @Test
    void shouldRejectIdea() {
        doNothing().when(ideaRepository).deleteById(1L);

        ideaService.rejectIdea(1L);

        verify(ideaRepository, times(1)).deleteById(1L);
    }

    @Test
    void shouldVoteForIdea() {
        String sessionId = "test-session";
        String username = "testuser";  // ⬅️ ÚJ
        testIdea.setApproved(true);
        testIdea.setVotes(0);

        when(voteRecordRepository.existsByUsername(username)).thenReturn(false);  // ⬅️ VÁLTOZÁS
        when(ideaRepository.findById(1L)).thenReturn(Optional.of(testIdea));
        when(voteRecordRepository.save(any(VoteRecord.class))).thenReturn(new VoteRecord());
        when(ideaRepository.save(any(Idea.class))).thenReturn(testIdea);

        Idea result = ideaService.vote(1L, username, sessionId);  // ⬅️ VÁLTOZÁS

        assertEquals(1, result.getVotes());
        verify(voteRecordRepository, times(1)).existsByUsername(username);  // ⬅️ VÁLTOZÁS
        verify(voteRecordRepository, times(1)).save(any(VoteRecord.class));
        verify(ideaRepository, times(1)).save(testIdea);
    }

    @Test
    void shouldThrowExceptionWhenVotingTwice() {
        String sessionId = "test-session";
        String username = "testuser";  // ⬅️ ÚJ
        VoteRecord existingVote = new VoteRecord(1L, username, sessionId);  // ⬅️ VÁLTOZÁS

        when(voteRecordRepository.existsByUsername(username)).thenReturn(true);  // ⬅️ VÁLTOZÁS
        when(voteRecordRepository.findByUsername(username)).thenReturn(Optional.of(existingVote));  // ⬅️ VÁLTOZÁS

        assertThrows(IllegalStateException.class, () -> ideaService.vote(1L, username, sessionId));  // ⬅️ VÁLTOZÁS
        verify(ideaRepository, never()).save(any(Idea.class));
    }

    @Test
    void shouldThrowExceptionWhenVotingForNonExistentIdea() {
        String sessionId = "test-session";
        String username = "testuser";  // ⬅️ ÚJ

        when(voteRecordRepository.existsByUsername(username)).thenReturn(false);  // ⬅️ VÁLTOZÁS
        when(ideaRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> ideaService.vote(999L, username, sessionId));  // ⬅️ VÁLTOZÁS
    }

    @Test
    void shouldCountVotesForIdea() {
        when(voteRecordRepository.countByIdeaId(1L)).thenReturn(5L);

        long count = ideaService.votesForIdea(1L);

        assertEquals(5L, count);
        verify(voteRecordRepository, times(1)).countByIdeaId(1L);
    }
}