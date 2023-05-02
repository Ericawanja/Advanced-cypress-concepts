/// <reference types="cypress" />

describe('share location', () => {

  beforeEach(() => {
//getting the data from the fixtures
cy.clock()

cy.fixture("user-location.json").as("userLocation");


    cy.visit('/').then((win) => {

      cy.get('@userLocation').then((fakePos)=>{
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').as("getUserPosition").callsFake((cb) => {
          setTimeout(() => {
            cb(fakePos)
          }, 100)
  
        })

      })
     
      cy.stub(win.navigator.clipboard, 'writeText').as('copyToClipboard').resolves()
      cy.spy(win.localStorage, 'setItem').as('storeLocation');
      cy.spy(win.localStorage, 'getItem').as('getStoredLocation')
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
    //cy.get('@copyToClipboard').should('have.been.calledWithMatch', new RegExp(`${37}.*${39}.*${encodeURI('John Doe')}`))

    cy.get('@userLocation').then((fakePos)=>{
      const {latitude, longitude} = fakePos.coords;
      cy.get('@copyToClipboard').should('have.been.calledWithMatch', new RegExp(`${latitude}.*${longitude}.*${encodeURI('John Doe')}`))
    })

    cy.get('@storeLocation').should('have.been.called')
    cy.get('[data-cy="share-loc-btn"]').click()
    cy.get('@getStoredLocation').should('have.been.called')

    //checking the dialog box

    cy.get('[data-cy="info-message"]').should('be.visible')
 
    cy.tick(2000);
    cy.get('[data-cy="info-message"]').should("not.be.visible")
  })

  // 
});
