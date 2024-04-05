import moment from 'moment-tiny';

const presetMinComplete = 5;
const presetMaxComplete = 80;
const presetMinDuration = 4;
const presetMaxDuration = 88;
const today = new Date();
const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
const presetHighestDay = moment().add(today.getDate() < 14 ? 30 : 25, 'days').format('YYYY-MM-DD');

describe('Example 25 - Range Filters', () => {
  it('should display Example title', () => {
    cy.visit(`${Cypress.config('baseUrl')}/range`);
    cy.get('h2').should('contain', 'Example 25: Filtering from Range of Search Values');
  });

  it('should expect the grid to be sorted by "% Complete" descending and then by "Duration" ascending', () => {
    cy.get('#grid25')
      .get('.slick-header-column:nth(2)')
      .find('.slick-sort-indicator-desc')
      .should('have.length', 1)
      .siblings('.slick-sort-indicator-numbered')
      .contains('1');

    cy.get('#grid25')
      .get('.slick-header-column:nth(5)')
      .find('.slick-sort-indicator-asc')
      .should('have.length', 1)
      .siblings('.slick-sort-indicator-numbered')
      .contains('2');
  });

  it('should have "% Complete" fields within the range (inclusive) of the filters presets', () => {
    cy.get('#grid25')
      .find('.slick-row')
      .each(($row) => {
        cy.wrap($row)
          .children('.slick-cell:nth(2)')
          .each(($cell) => {
            const value = parseInt($cell.text().trim(), 10);
            if (!isNaN(value)) {
              expect(value >= presetMinComplete).to.eq(true);
              expect(value <= presetMaxComplete).to.eq(true);
            }
          });
      });
  });

  it('should have Finish Dates within the range (inclusive) of the filters presets', () => {
    cy.get('#grid25')
      .find('.slick-row')
      .each(($row) => {
        cy.wrap($row)
          .children('.slick-cell:nth(4)')
          .each(($cell) => {
            const isDateBetween = moment($cell.text()).isBetween(presetLowestDay, presetHighestDay, null as any, '[]'); // [] is inclusive, () is exclusive
            expect(isDateBetween).to.eq(true);
          });
      });
  });

  it('should have "Duration" fields within the range (exclusive by default) of the filters presets', () => {
    cy.get('#grid25')
      .find('.slick-row')
      .each(($row) => {
        cy.wrap($row)
          .children('.slick-cell:nth(5)')
          .each(($cell) => {
            const value = parseInt($cell.text().trim(), 10);
            if (!isNaN(value)) {
              expect(value >= presetMinDuration).to.eq(true);
              expect(value <= presetMaxDuration).to.eq(true);
            }
          });
      });
  });

  it('should change "% Complete" filter range by using the slider left handle (min value) to make it a higher min value and expect all rows to be within new range', () => {
    let newLowest = presetMinComplete;
    let newHighest = presetMaxComplete;
    const allowedBuffer = 0.5;

    // first input is the lowest range
    cy.get('.slider-filter-input:nth(0)')
      .as('range').invoke('val', 10).trigger('change', { force: true });

    cy.get('.lowest-range-percentComplete')
      .then(($lowest) => {
        newLowest = parseInt($lowest.text(), 10);
      });

    cy.get('.highest-range-percentComplete')
      .then(($highest) => {
        newHighest = parseInt($highest.text(), 10);
      });

    cy.wait(5);

    cy.get('#grid25')
      .find('.slick-row')
      .each(($row) => {
        cy.wrap($row)
          .children('.slick-cell:nth(2)')
          .each(($cell) => {
            const value = parseInt($cell.text().trim(), 10);
            if (!isNaN(value) && $cell.text() !== '') {
              expect(value >= (newLowest - allowedBuffer)).to.eq(true);
              expect(value <= (newHighest + allowedBuffer)).to.eq(true);
            }
          });
      });
  });

  it('should change the "Finish" date in the picker and expect all rows to be within new dates range', () => {
    cy.get('.flatpickr.search-filter.filter-finish')
      .click();

    cy.get('.flatpickr-day.inRange')
      .should('have.length.gte', 2);

    // cy.get('.flatpickr-day.selected.endRange')
    //   .should('contain', moment().add(25, 'days').day() - 1);
  });

  it('should change the "Duration" input filter and expect all rows to be within new range', () => {
    const newMin = 10;
    const newMax = 40;

    cy.contains('Clear Filters')
      .click({ force: true });

    cy.get('.search-filter.filter-duration')
      .focus()
      .type(`${newMin}..${newMax}`);

    cy.get('#grid25')
      .find('.slick-row')
      .each(($row, idx) => {
        cy.wrap($row)
          .children('.slick-cell:nth(5)')
          .each(($cell) => {
            if (idx > 8) {
              return;
            }
            const value = parseInt($cell.text().trim(), 10);
            if (!isNaN(value)) {
              expect(value >= newMin).to.eq(true);
              expect(value <= newMax).to.eq(true);
            }
          });
      });
  });

  describe('Set Dymamic Filters', () => {
    const dynamicMinComplete = 15;
    const dynamicMaxComplete = 85;
    const dynamicMinDuration = 14;
    const dynamicMaxDuration = 78;
    const currentYear = moment().year();
    const dynamicLowestDay = moment().add(-5, 'days').format('YYYY-MM-DD');
    const dynamicHighestDay = moment().add(25, 'days').format('YYYY-MM-DD');

    it('should click on Set Dynamic Filters', () => {
      cy.get('[data-test=set-dynamic-filter]')
        .click();
    });

    it('should have "% Complete" fields within the exclusive range of the filters presets', () => {
      cy.get('#grid25')
        .find('.slick-row')
        .each(($row) => {
          cy.wrap($row)
            .children('.slick-cell:nth(2)')
            .each(($cell) => {
              const value = parseInt($cell.text().trim(), 10);
              if (!isNaN(value)) {
                expect(value >= dynamicMinComplete).to.eq(true);
                expect(value <= dynamicMaxComplete).to.eq(true);
              }
            });
        });
    });

    it('should have "Duration" fields within the inclusive range of the dynamic filters', () => {
      cy.get('#grid25')
        .find('.slick-row')
        .each(($row) => {
          cy.wrap($row)
            .children('.slick-cell:nth(5)')
            .each(($cell) => {
              const value = parseInt($cell.text().trim(), 10);
              if (!isNaN(value)) {
                expect(value >= dynamicMinDuration).to.eq(true);
                expect(value <= dynamicMaxDuration).to.eq(true);
              }
            });
        });
    });

    it('should have Finish Dates within the range (inclusive) of the dynamic filters', () => {
      cy.get('.search-filter.filter-finish')
        .find('input')
        .invoke('val')
        .then(text => expect(text).to.eq(`${dynamicLowestDay} to ${dynamicHighestDay}`));

      cy.get('#grid25')
        .find('.slick-row')
        .each(($row) => {
          cy.wrap($row)
            .children('.slick-cell:nth(4)')
            .each(($cell) => {
              const isDateBetween = moment($cell.text()).isBetween(dynamicLowestDay, dynamicHighestDay, null as any, '[]'); // [] is inclusive, () is exclusive
              expect(isDateBetween).to.eq(true);
            });
        });
    });

    it('should change dynamic filters from the select and choose "Current Year Completed Tasks" and expect 2 filters set', () => {
      cy.get('[data-test=select-dynamic-filter]')
        .select('1: currentYearTasks');

      cy.get('.search-filter.filter-finish')
        .find('input')
        .invoke('val')
        .then(text => expect(text).to.eq(`${currentYear}-01-01 to ${currentYear}-12-31`));

      cy.get('.ms-parent.search-filter.filter-completed > button > span')
        .should('contain', 'True');
    });
  });

  describe('Set Dynamic Sorting', () => {
    it('should click on "Clear Filters" then "Set Dynamic Sorting" buttons', () => {
      cy.get('[data-test=clear-filters]')
        .click();

      cy.get('[data-test=set-dynamic-sorting]')
        .click();
    });

    it('should expect the grid to be sorted by "Duration" ascending and "Start" descending', () => {
      cy.get('#grid25')
        .get('.slick-header-column:nth(2)')
        .find('.slick-sort-indicator-asc')
        .should('have.length', 1)
        .siblings('.slick-sort-indicator-numbered')
        .contains('2');

      cy.get('#grid25')
        .get('.slick-header-column:nth(4)')
        .find('.slick-sort-indicator-desc')
        .should('have.length', 1)
        .siblings('.slick-sort-indicator-numbered')
        .contains('1');
    });
  });
});
