describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login'); 
  });

  it('should display login form', () => {
    cy.get('h1').should('contain.text', 'Welcome back');
    cy.get('input#username').should('exist');
    cy.get('input#password').should('exist');
    cy.get('button.login-button').should('contain.text', 'Sign in');
  });

  it('should show error if username is empty', () => {
    cy.get('input#password').type('mypassword');
    cy.get('button.login-button').click();
    cy.get('.error-message').should('contain.text', 'Please enter your username');
  });

  it('should show error if password is empty', () => {
    cy.get('input#username').type('mariem');
    cy.get('button.login-button').click();
    cy.get('.error-message').should('contain.text', 'Please enter your password');
  });

  it('should try login with valid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' }
    }).as('loginRequest');

    cy.get('input#username').type('mariem');
    cy.get('input#password').type('mypassword');
    cy.get('button.login-button').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/boards');
  });
});
