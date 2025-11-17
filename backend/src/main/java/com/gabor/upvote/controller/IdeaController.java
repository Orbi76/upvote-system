package com.gabor.upvote.controller;

        import com.gabor.upvote.dto.IdeaRequest;
        import com.gabor.upvote.model.Idea;
        import com.gabor.upvote.service.IdeaService;
        import io.swagger.v3.oas.annotations.Operation;
        import io.swagger.v3.oas.annotations.tags.Tag;
        import jakarta.servlet.http.HttpSession;
        import jakarta.validation.Valid;
        import org.springframework.http.ResponseEntity;
        import org.springframework.security.access.prepost.PreAuthorize;
        import org.springframework.security.core.Authentication;
        import org.springframework.web.bind.annotation.*;

        import java.util.List;
        import java.util.Map;
        import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/ideas")
@Tag(name = "Ideas", description = "Idea submission and voting")
public class IdeaController {

    private final IdeaService ideaService;

    public IdeaController(IdeaService ideaService) {
        this.ideaService = ideaService;
    }

    @PostMapping
    @Operation(summary = "Submit an idea (visible after admin approval)")
    public ResponseEntity<Idea> submitIdea(@Valid @RequestBody IdeaRequest request) {
        Idea idea = new Idea(request.getTitle(), request.getDescription());
        Idea saved = ideaService.submitIdea(idea);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    @Operation(summary = "List approved ideas (for voters)")
    public ResponseEntity<List<Idea>> listApproved() {
        return ResponseEntity.ok(ideaService.listApprovedIdeas());
    }

    @PostMapping("/{id}/vote")
    @Operation(summary = "Vote for an idea (one vote per user)")
    public ResponseEntity<?> vote(@PathVariable Long id, HttpSession session, Authentication authentication) {
        String sessionId = session.getId();
        String username = authentication.getName();

        try {
            Idea updated = ideaService.vote(id, username, sessionId);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            // 409 Conflict - már szavazott
            return ResponseEntity.status(409).body(Map.of(
                    "error", "Already voted",
                    "message", e.getMessage()
            ));
        } catch (NoSuchElementException e) {
            // 404 Not Found
            return ResponseEntity.status(404).body(Map.of(
                    "error", "Not found",
                    "message", e.getMessage()
            ));
        }
    }

    // Admin endpoints
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Idea>> pendingIdeas() {
        return ResponseEntity.ok(ideaService.listPendingIdeas());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Idea> approve(@PathVariable Long id) {
        Idea approved = ideaService.approveIdea(id);
        return ResponseEntity.ok(approved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ideaService.rejectIdea(id);
        return ResponseEntity.noContent().build();
    }
}
