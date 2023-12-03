describe("Landing page", () => {
  it("should navigate to the landing page", () => {
    cy.visit("/");
    cy.get("div").should(
      "contain",
      "Framework is a new way to make your dreams come true. Free, open and safe game platform"
    );
  });

  it("should close cookie popup", () => {
    cy.visit("/");
    cy.get("div[data-cy=landing-cookie-dialog]").should(
      "contain",
      "Framework and other Solarius services use cookies to help us provide you the best experience."
    );
    cy.get("button[data-cy=landing-accept-cookie]").click();
    cy.get("div[data-cy=landing-cookie-dialog]").should("not.exist");
  });

  it("should contain get started button", () => {
    cy.visit("/");
    cy.get("button[data-cy=landing-header-register]").should(
      "contain",
      "Get started"
    );
  });
});
