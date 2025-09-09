// cypress/support/index.d.ts
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to fill registration form
     * @example cy.fillRegistrationForm('username', 'email@test.com', 'password123')
     */
    fillRegistrationForm(username: string, email: string, password: string): Chainable<void>;
    
    /**
     * Custom command to submit registration form
     * @example cy.submitRegistrationForm()
     */
    submitRegistrationForm(): Chainable<void>;
    
    /**
     * Custom command to expect validation error
     * @example cy.expectValidationError('Username is required')
     */
    expectValidationError(message: string): Chainable<void>;
    
    /**
     * Custom command to create a new board
     * @example cy.createBoard('My New Board')
     */
    createBoard(name: string): Chainable<void>;
    
    /**
     * Custom command to add a card to a list
     * @example cy.addCardToList(0, 'New Task')
     */
    addCardToList(listIndex: number, cardTitle: string): Chainable<void>;
    
    /**
     * Custom command to wait for Angular to be stable
     * @example cy.waitForAngular()
     */
    waitForAngular(): Chainable<void>;
  }
}