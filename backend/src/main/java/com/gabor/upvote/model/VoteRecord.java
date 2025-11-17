package com.gabor.upvote.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vote_records", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"idea_id", "username"})  // ⬅️ VÁLTOZÁS!
})
public class VoteRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idea_id", nullable = false)
    private Long ideaId;

    @Column(name = "username", nullable = false, length = 100)  // ⬅️ ÚJ MEZŐ!
    private String username;

    @Column(name = "session_id", nullable = false, length = 200)
    private String sessionId;

    private Instant votedAt = Instant.now();

    public VoteRecord() {}

    public VoteRecord(Long ideaId, String username, String sessionId) {  // ⬅️ VÁLTOZÁS!
        this.ideaId = ideaId;
        this.username = username;
        this.sessionId = sessionId;
    }

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIdeaId() { return ideaId; }
    public void setIdeaId(Long ideaId) { this.ideaId = ideaId; }
    public String getUsername() { return username; }  // ⬅️ ÚJ!
    public void setUsername(String username) { this.username = username; }  // ⬅️ ÚJ!
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public Instant getVotedAt() { return votedAt; }
    public void setVotedAt(Instant votedAt) { this.votedAt = votedAt; }
}