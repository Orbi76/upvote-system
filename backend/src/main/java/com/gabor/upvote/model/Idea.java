package com.gabor.upvote.model;

        import jakarta.persistence.*;
        import java.time.Instant;

@Entity
@Table(name = "ideas")
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 4000)
    private String description;

    private boolean approved = false;

    private int votes = 0;

    private Instant createdAt = Instant.now();

    public Idea() {}

    public Idea(String title, String description) {
        this.title = title;
        this.description = description;
    }

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public int getVotes() { return votes; }
    public void setVotes(int votes) { this.votes = votes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
