/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
// cypress/support/commands.ts
Cypress.Commands.add('fillRegistrationForm', (username: string, email: string, password: string) => {
  cy.get('input[id="username"]').type(username);
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
});

Cypress.Commands.add('submitRegistrationForm', () => {
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('expectValidationError', (message: string) => {
  cy.get('.field-error').should('contain', message);
});

Cypress.Commands.add('createBoard', (name: string) => {
  cy.get('button').contains('Create New Board').click();
  cy.get('#boardName').type(name);
  cy.get('button').contains('Create Board').click();
});

Cypress.Commands.add('addCardToList', (listIndex: number, cardTitle: string) => {
  cy.get('.list-container').eq(listIndex).within(() => {
    cy.get('button').contains('Add a card').click();
    cy.get('input[placeholder*="title"]').type(cardTitle);
    cy.get('button').contains('Add Card').click();
  });
});

Cypress.Commands.add('waitForAngular', () => {
  cy.window().then((win: any) => {
    if (win.getAllAngularTestabilities) {
      return new Cypress.Promise((resolve) => {
        const testabilities = win.getAllAngularTestabilities();
        let allStable = false;
        
        const checkStable = () => {
          allStable = testabilities.every((testability: any) => testability.isStable());
          if (allStable) {
            resolve();
          } else {
            setTimeout(checkStable, 100);
          }
        };
        
        checkStable();
      });
    }
  });
});