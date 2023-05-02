/// <reference types="cypress" />

describe('share location', () => {
  beforeEach(() => {
    cy.visit('/').then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').as("getUserPosition").callsFake((cb) => {
        setTimeout(() => {
          cb({
            coords: {
              latitude: 37,
              longitude: 39
            }
          })
        }, 100)

      })
      cy.stub(win.navigator.clipboard, 'writeText').as('copyToClipboard').resolves()
    });
  })
  it('should fetch the user location', () => {
    cy.get('[data-cy="get-loc-btn"]').click();
    cy.get("@getUserPosition").should('have.been.called')
    cy.get('[data-cy="get-loc-btn"]').should('be.disabled')
    cy.get('[data-cy="actions"]').should('contain', 'Location fetched') //alternative for contains()
  });

  it('shares the user location', () => {
    cy.get('[data-cy="name-input"]').type('John Doe');
    cy.get('[data-cy="get-loc-btn"]').click()
    cy.get('[data-cy="share-loc-btn"]').click()
    cy.get("@copyToClipboard").should("have.been.called")

    //evaluatin stub arguments
    cy.get('@copyToClipboard').should('have.been.calledWithMatch', new RegExp(`${37}.*${39}.*${encodeURI('John Doe')}`))
  })
});
