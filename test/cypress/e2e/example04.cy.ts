import moment from 'moment-tiny';
import { removeExtraSpaces } from '../plugins/utilities';

describe('Example 4 - Client Side Sort/Filter Grid', () => {
  it('should display Example title', () => {
    cy.visit(`${Cypress.config('baseUrl')}/clientside`);
    cy.get('h2').should('contain', 'Example 4: Client Side Sort/Filter');
  });

  describe('Load Grid with Presets', () => {
    const presetDurationValues = [98, 10];
    const presetUsDateShort = '04/20/25';

    it('should have "Duration" fields within the inclusive range of the preset filters and be displayed in the Filter itself', () => {
      cy.get('.ms-filter.search-filter.filter-duration.filled')
        .find('.ms-choice')
        .contains('98, 10');

      cy.get('#grid4')
        .find('.slick-row')
        .each(($row) => {
          cy.wrap($row)
            .children('.slick-cell:nth(2)')
            .each(($cell) => {
              const value = parseInt($cell.text().trim(), 10);
              if (!isNaN(value)) {
                const foundItems = presetDurationValues.filter(acceptedValue => acceptedValue === value);
                expect(foundItems).to.have.length(1);
              }
            });
        });
    });

    it('should have US Date Short within the range of the preset filters', () => {
      cy.get('.search-filter.filter-usDateShort')
        .find('input')
        .invoke('val')
        .then(text => expect(text).to.eq(presetUsDateShort));

      cy.get('#grid4')
        .find('.slick-row')
        .each(($row) => {
          cy.wrap($row)
            .children('.slick-cell:nth(5)')
            .each(($cell) => {
              const isDateValid = moment($cell.text(), 'M/D/YY').isBefore(presetUsDateShort);
              expect(isDateValid).to.eq(true);
            });
        });
    });

    it('should have some metrics shown in the grid footer well below 1500 items', () => {
      cy.get('#slickGridContainer-grid4')
        .find('.slick-custom-footer')
        .find('.right-footer')
        .should($span => {
          const text = removeExtraSpaces($span.text()); // remove all white spaces
          expect(text).not.to.eq('1500 of 1500 items');
        });
    });

    it('should expect the grid to be sorted by "Duration" descending and "% Complete" ascending', () => {
      cy.get('#grid4')
        .get('.slick-header-column:nth(2)')
        .find('.slick-sort-indicator-desc')
        .should('have.length', 1)
        .siblings('.slick-sort-indicator-numbered')
        .contains('1');

      cy.get('#grid4')
        .get('.slick-header-column:nth(3)')
        .find('.slick-sort-indicator-asc')
        .should('have.length', 1)
        .siblings('.slick-sort-indicator-numbered')
        .contains('2');

      cy.get('.slick-row')
        .first()
        .children('.slick-cell:nth(2)')
        .should('contain', '98');

      cy.get('[data-test="scroll-bottom-btn"')
        .click();

      cy.get('.slick-row')
        .last()
        .children('.slick-cell:nth(2)')
        .should('contain', '10');
    });
  });

  describe('Set Dymamic Filters', () => {
    const dynamicDurationValues = [2, 25, 48, 50];
    const dynamicMaxComplete = 95;
    const dynamicStartDate = '2001-02-28';

    it('should click on Set Dynamic Filters', () => {
      cy.get('[data-test=set-dynamic-filter]')
        .click();
    });

    it('should have "% Complete" fields within the exclusive range of the filters presets', () => {
      cy.get('#grid4')
        .find('.slick-row')
        .each(($row) => {
          cy.wrap($row)
            .children('.slick-cell:nth(3)')
            .each(($cell) => {
              const value = parseInt($cell.text().trim(), 10);
              if (!isNaN(value)) {
                expect(value < dynamicMaxComplete).to.eq(true);
              }
            });
        });
    });

    it('should have "Duration" fields within the inclusive range of the dynamic filters', () => {
      cy.get('#grid4')
        .find('.slick-row')
        .each(($row) => {
          cy.wrap($row)
            .children('.slick-cell:nth(2)')
            .each(($cell) => {
              const value = parseInt($cell.text().trim(), 10);
              if (!isNaN(value)) {
                const foundItems = dynamicDurationValues.filter(acceptedValue => acceptedValue === value);
                expect(foundItems).to.have.length(1);
              }
            });
        });
    });

    it('should have Start Date within the range of the dynamic filters', () => {
      cy.get('.search-filter.filter-start')
        .find('input')
        .invoke('val')
        .then(text => expect(text).to.eq(dynamicStartDate));

      cy.get('#grid4')
        .find('.slick-row')
        .each(($row) => {
          cy.wrap($row)
            .children('.slick-cell:nth(4)')
            .each(($cell) => {
              const isDateValid = moment($cell.text()).isSameOrAfter(dynamicStartDate);
              expect(isDateValid).to.eq(true);
            });
        });
    });
  });

  describe('Set Dynamic Sorting', () => {
    it('should click on "Clear Filters" then "Set Dynamic Sorting" buttons', () => {
      cy.get('[data-test=clear-filters]')
        .click();

      cy.get('[data-test=set-dynamic-sorting]')
        .click();
    });

    it('should have some metrics shown in the grid footer', () => {
      cy.get('#slickGridContainer-grid4')
        .find('.slick-custom-footer')
        .find('.right-footer')
        .should($span => {
          const text = removeExtraSpaces($span.text()); // remove all white spaces
          expect(text).to.eq('1500 of 1500 items');
        });
    });

    it('should expect the grid to be sorted by "Duration" ascending and "Start" descending', () => {
      cy.get('#grid4')
        .get('.slick-header-column:nth(2)')
        .find('.slick-sort-indicator-asc')
        .should('have.length', 1)
        .siblings('.slick-sort-indicator-numbered')
        .contains('1');

      cy.get('#grid4')
        .get('.slick-header-column:nth(4)')
        .find('.slick-sort-indicator-desc')
        .should('have.length', 1)
        .siblings('.slick-sort-indicator-numbered')
        .contains('2');

      cy.get('.slick-row')
        .first()
        .children('.slick-cell:nth(2)')
        .should('contain', '0');

      cy.get('[data-test="scroll-bottom-btn"')
        .click();

      cy.get('.slick-row')
        .last()
        .children('.slick-cell:nth(2)')
        .should('contain', '100');

      cy.get('.slick-row')
        .last()
        .children('.slick-cell:nth(4)')
        .should('contain', '');
    });
  });
});
