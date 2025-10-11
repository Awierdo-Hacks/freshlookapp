describe('Infinite Scroll E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load initial outfits', () => {
    cy.get('[data-testid="outfit-card"]').should('have.length.greaterThan', 0);
    cy.contains('FreshLook Catalogus').should('be.visible');
  });

  it('should load more outfits when scrolling', () => {
    cy.get('[data-testid="outfit-card"]').then($cards => {
      const initialCount = $cards.length;
      
      cy.scrollTo('bottom');
      cy.wait(2000);
      
      cy.get('[data-testid="outfit-card"]').should('have.length.greaterThan', initialCount);
    });
  });

  it('should filter outfits by style', () => {
    cy.get('[data-testid="style-select"]').select('Old money');
    cy.wait(1000);
    
    cy.get('[data-testid="outfit-card"]').each($card => {
      cy.wrap($card).should('contain.text', 'Old money');
    });
  });

  it('should filter outfits by price range', () => {
    cy.get('[data-testid="min-price"]').type('100');
    cy.get('[data-testid="max-price"]').type('200');
    cy.wait(1000);
    
    cy.get('[data-testid="outfit-price"]').each($price => {
      const price = parseFloat($price.text().replace('€', ''));
      expect(price).to.be.within(100, 200);
    });
  });

  it('should clear filters', () => {
    cy.get('[data-testid="style-select"]').select('Old money');
    cy.get('[data-testid="min-price"]').type('100');
    
    cy.get('[data-testid="clear-filters"]').click();
    
    cy.get('[data-testid="style-select"]').should('have.value', '');
    cy.get('[data-testid="min-price"]').should('have.value', '');
  });

  it('should be keyboard accessible', () => {
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'style-select');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-testid', 'min-price');
  });
});
