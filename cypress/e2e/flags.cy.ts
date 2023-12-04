describe("Flags", () => {
  it("should successfully fetch flags", () => {
    cy.request({
      method: "GET",
      url: "/api/flags",
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("success", true);
    });
  });
});
