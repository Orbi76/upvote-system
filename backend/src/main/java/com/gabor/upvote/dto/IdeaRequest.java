package com.gabor.upvote.dto;

        import jakarta.validation.constraints.NotBlank;
        import jakarta.validation.constraints.Size;

public class IdeaRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 4000)
    private String description;

    // getters / setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
