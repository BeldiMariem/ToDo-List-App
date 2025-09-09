describe('Registration Component', () => {
    beforeEach(() => {
        cy.intercept('POST', '/api/auth/register', {
            statusCode: 201,
            body: { message: 'Registration successful' }
        }).as('registerRequest');

        cy.visit('/register');
        cy.wait(1000);
    });

    it('should display registration page correctly', () => {
        cy.get('h1').should('contain', 'Create an account');
        cy.get('.subtitle').should('contain', 'Join us and start your journey');
        cy.get('form').should('exist');
        cy.get('input[id="username"]').should('be.visible');
        cy.get('input[id="email"]').should('be.visible');
        cy.get('input[id="password"]').should('be.visible');
        cy.get('button[type="submit"]').should('contain', 'Create Account');
    });

    it('should show validation errors when fields are touched', () => {
        cy.get('input[id="username"]').focus().blur();
        cy.get('input[id="email"]').focus().blur();
        cy.get('input[id="password"]').focus().blur();

        cy.get('.field-error').should('have.length.at.least', 2);
        cy.contains('Username is required').should('be.visible');
        cy.contains('Email is required').should('be.visible');
        cy.contains('Password is required').should('be.visible');

        cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should validate username requirements', () => {
        const usernameField = cy.get('input[id="username"]');

        usernameField.type('ab');
        usernameField.blur();
        cy.contains('Must be at least 3 characters').should('be.visible');

        usernameField.clear().type('valid_user123');
        cy.get('.field-error').should('not.exist');
    });

    it('should validate email format', () => {
        const emailField = cy.get('input[id="email"]');

        emailField.type('invalid-email');
        emailField.blur();
        cy.contains('Please enter a valid email address').should('be.visible');

        emailField.clear().type('test@example.com');
        cy.get('.field-error').should('not.exist');
    });

    it('should show password strength indicator for valid passwords', () => {
        const passwordField = cy.get('input[id="password"]');

        passwordField.type('ValidPass123');

        cy.get('.password-strength', { timeout: 5000 }).should('be.visible');
        cy.get('.strength-text').should('contain', 'password');
        cy.get('.strength-bar').should('have.class', 'medium');
    });

    it('should validate password requirements', () => {
        const passwordField = cy.get('input[id="password"]');

        passwordField.type('short');
        passwordField.blur();
        cy.contains('Must be at least 6 characters').should('be.visible');

        passwordField.clear().type('ValidPassword123');
        cy.get('.field-error').should('not.exist');
    });

    it('should redirect to login after successful registration', () => {
        cy.get('input[id="username"]').type('testuser123');
        cy.get('input[id="email"]').type('test@example.com');
        cy.get('input[id="password"]').type('TestPassword123');

        cy.get('button[type="submit"]').should('not.be.disabled').click();

        cy.get('button[type="submit"]').should('contain', 'Creating Account…');

        cy.wait('@registerRequest');
        cy.url().should('include', '/login');

    });
    it('should handle registration errors', () => {
        cy.intercept('POST', '/api/auth/register', {
            statusCode: 400,
            body: { error: 'Username already exists' }
        }).as('registerError');

        cy.get('input[id="username"]').type('existinguser');
        cy.get('input[id="email"]').type('test@example.com');
        cy.get('input[id="password"]').type('TestPassword123');

        cy.get('button[type="submit"]').click();

        cy.wait('@registerError');

        cy.get('body').then(($body) => {
            console.log('Page content after error:', $body.text());
            console.log('Current URL:', window.location.href);
        });

        cy.url().should('include', '/register');

        cy.log('Registration failed - user stayed on registration page (expected behavior)');
    });
    it('should have working login link', () => {
        cy.get('a[routerLink="/login"]').click();
        cy.url().should('include', '/login');
    });
});