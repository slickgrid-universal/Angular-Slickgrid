import moment from 'moment-tiny';
import { removeWhitespaces } from '../plugins/utilities';

const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
const presetHighestDay = moment().add(20, 'days').format('YYYY-MM-DD');

describe('Example 6 - GraphQL Grid', { retries: 0 }, () => {
  it('should display Example title', () => {
    cy.visit(`${Cypress.config('baseUrl')}/gridgraphql`);
    cy.get('h2').should('contain', 'Example 6: Grid connected to Backend Server with GraphQL');
  });

  it('should have a grid of size 900 by 200px', () => {
    cy.get('#slickGridContainer-grid6')
      .should('have.css', 'width', '900px');

    cy.get('#slickGridContainer-grid6 > .slickgrid-container')
      .should($el => expect(parseInt(`${$el.height()}`, 10)).to.eq(200));
  });

  it('should have English Text inside some of the Filters', () => {
    cy.get('.search-filter.filter-gender .ms-choice > span')
      .contains('Male');

    cy.get('.flatpickr-input')
      .should('contain.value', 'to'); // date range will contains (y to z) or in French (y au z)
  });

  it('should have GraphQL query with defined Grid Presets', () => {
    cy.get('.search-filter.filter-name select')
      .should('not.have.value')

    cy.get('.search-filter.filter-name')
      .find('input')
      .invoke('val')
      .then(text => expect(text).to.eq('John Doe'));

    cy.get('.search-filter.filter-gender .ms-choice > span')
      .contains('Male');

    cy.get('.search-filter.filter-company .ms-choice > span')
      .contains('Company XYZ');

    cy.get('.search-filter.filter-finish')
      .find('input')
      .invoke('val')
      .then(text => expect(text).to.eq(`${presetLowestDay} to ${presetHighestDay}`));

    cy.get('[data-test=alert-graphql-query]').should('exist');
    cy.get('[data-test=alert-graphql-query]').should('contain', 'GraphQL Query');

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:20,offset:20,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[
            {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
            {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
          ],locale:"en",userId:123){
            totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should use fake smaller server wait delay for faster E2E tests', () => {
    cy.get('[data-test="server-delay"]')
      .clear()
      .type('20');
  });

  it('should change Pagination to next page', () => {
    cy.get('.icon-seek-next').click();

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:20,offset:40,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[
            {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
            {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
          ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should change Pagination to last page', () => {
    cy.get('.icon-seek-end').click();

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:20,offset:80,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[
            {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
            {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
          ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should change Pagination to first page using the external button', () => {
    cy.get('[data-test=goto-first-page')
      .click();

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query { users (first:20,offset:0,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[
            {field:"gender",operator:EQ,value:"male"},
            {field:"name",operator:Contains,value:"John Doe"},
            {field:"company",operator:IN,value:"xyz"},
            {field:"finish",operator:GE,value:"${presetLowestDay}"},
            {field:"finish",operator:LE,value:"${presetHighestDay}"}
          ],locale:"en",userId:123) { totalCount, nodes { id,name,gender,company,billing{address{street,zip}},finish } } }`));
      });
  });

  it('should change Pagination to last page using the external button', () => {
    cy.get('[data-test=goto-last-page')
      .click();

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:20,offset:80,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[
            {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
            {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
          ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should change Pagination to first page with 30 items', () => {
    cy.get('.icon-seek-first').click();

    cy.get('#items-per-page-label').select('30');

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[
            {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
            {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
          ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should clear a single filter, that is not empty, by the header menu and expect query change', () => {
    cy.get('#grid6')
      .find('.slick-header-left .slick-header-column:nth(0)')
      .trigger('mouseover')
      .children('.slick-header-menu-button')
      .should('be.hidden')
      .invoke('show')
      .click();

    cy.get('.slick-header-menu .slick-menu-command-list')
      .should('be.visible')
      .children('.slick-menu-item:nth-of-type(6)')
      .children('.slick-menu-content')
      .should('contain', 'Remove Filter')
      .click();

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[
            {field:"gender",operator:EQ,value:"male"},{field:"company",operator:IN,value:"xyz"},
            {field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
          ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should try clearing same filter, which is now empty, by the header menu and expect same query without loading spinner', () => {
    cy.get('[data-test="server-delay"]')
      .clear()
      .type('250');

    cy.get('#grid6')
      .find('.slick-header-left .slick-header-column:nth(0)')
      .trigger('mouseover')
      .children('.slick-header-menu-button')
      .invoke('show')
      .click();

    cy.get('.slick-header-menu .slick-menu-command-list')
      .should('be.visible')
      .children('.slick-menu-item:nth-of-type(6)')
      .children('.slick-menu-content')
      .should('contain', 'Remove Filter')
      .click();

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[
            {field:"gender",operator:EQ,value:"male"},{field:"company",operator:IN,value:"xyz"},
            {field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
          ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should clear the date range filter expect the query to have the 2 "finish" (GE, LE) filters removed', () => {
    cy.get('#grid6')
      .find('.slick-header-left .slick-header-column:nth(5)')
      .trigger('mouseover')
      .children('.slick-header-menu-button')
      .should('be.hidden')
      .invoke('show')
      .click();

    cy.get('.slick-header-menu .slick-menu-command-list')
      .should('be.visible')
      .children('.slick-menu-item:nth-of-type(6)')
      .children('.slick-menu-content')
      .should('contain', 'Remove Filter')
      .click();

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,
          orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
          filterBy:[{field:"gender",operator:EQ,value:"male"},{field:"company",operator:IN,value:"xyz"}],
          locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should Clear all Filters & Sorts', () => {
    cy.contains('Clear all Filter & Sorts').click();

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should click on "Name" column to sort it Ascending', () => {
    cy.get('.slick-header-columns')
      .children('.slick-header-left .slick-header-column:nth(0)')
      .click();

    cy.get('.slick-header-columns')
      .children('.slick-header-left .slick-header-column:nth(0)')
      .find('.slick-sort-indicator.slick-sort-indicator-asc')
      .should('be.visible');

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,
          orderBy:[{field:"name",direction:ASC}],
          locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should click on Set Dynamic Filter and expect query and filters to be changed', () => {
    cy.get('[data-test=set-dynamic-filter]')
      .click();

    cy.get('.search-filter.filter-name select')
      .should('have.value', 'a*')

    cy.get('.search-filter.filter-name')
      .find('input')
      .invoke('val')
      .then(text => expect(text).to.eq('Jane'));

    cy.get('.search-filter.filter-gender .ms-choice > span')
      .contains('Female');

    cy.get('.search-filter.filter-company .ms-choice > span')
      .contains('Acme');

    cy.get('.search-filter.filter-billingAddressZip select')
      .should('have.value', '>=')

    cy.get('.search-filter.filter-billingAddressZip')
      .find('input')
      .invoke('val')
      .then(text => expect(text).to.eq('11'));

    cy.get('.search-filter.filter-finish')
      .find('input')
      .invoke('val')
      .then(text => expect(text).to.eq(`${presetLowestDay} to ${presetHighestDay}`));

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,
          orderBy:[{field:"name",direction:ASC}],
          filterBy:[{field:"gender",operator:EQ,value:"female"},{field:"name",operator:StartsWith,value:"Jane"},
          {field:"company",operator:IN,value:"acme"},{field:"billing.address.zip",operator:GE,value:"11"},
          {field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}],locale:"en",userId:123)
          {totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  it('should use a range filter when searching with ".."', () => {
    cy.get('.slick-header-columns')
      .children('.slick-header-left .slick-header-column:nth(0)')
      .contains('Name')
      .click();

    cy.get('.search-filter.filter-name')
      .find('input')
      .clear()
      .type('Anthony Joyner..Ayers Hood');

    // wait for the query to finish
    cy.get('[data-test=status]').should('contain', 'finished');

    cy.get('[data-test=graphql-query-result]')
      .should(($span) => {
        const text = removeWhitespaces($span.text()); // remove all white spaces
        expect(text).to.eq(removeWhitespaces(`query { users (first:30,offset:0,
          orderBy:[{field:"name",direction:DESC}],
          filterBy:[{field:"gender",operator:EQ,value:"female"},{field:"name",operator:GE,value:"Anthony Joyner"},{field:"name",operator:LE,value:"Ayers Hood"},
          {field:"company",operator:IN,value:"acme"},{field:"billing.address.zip",operator:GE,value:"11"},
          {field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}],locale:"en",userId:123)
          {totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
      });
  });

  describe('Set Dynamic Sorting', () => {
    it('should use slower server wait delay to test loading widget', () => {
      cy.get('[data-test="server-delay"]')
        .clear()
        .type('250');
    });

    it('should click on "Clear all Filters & Sorting" then "Set Dynamic Sorting" buttons', () => {
      cy.get('[data-test=clear-filters-sorting]')
        .click();

      cy.get('[data-test=set-dynamic-sorting]')
        .click();

      // wait for the query to finish
      // cy.get('[data-test=status]').should('contain', 'processing');
      cy.get('[data-test=status]').should('contain', 'finished');
    });

    it('should use smaller server wait delay for faster E2E tests', () => {
      cy.get('[data-test="server-delay"]')
        .clear()
        .type('20');
    });

    it('should expect the grid to be sorted by "Zip" descending then by "Company" ascending', () => {
      cy.get('#grid6')
        .get('.slick-header-left .slick-header-column:nth(2)')
        .find('.slick-sort-indicator-asc')
        .should('have.length', 1)
        .siblings('.slick-sort-indicator-numbered')
        .contains('2');

      cy.get('#grid6')
        .get('.slick-header-left .slick-header-column:nth(3)')
        .find('.slick-sort-indicator-desc')
        .should('have.length', 1)
        .siblings('.slick-sort-indicator-numbered')
        .contains('1');

      cy.get('[data-test=graphql-query-result]')
        .should(($span) => {
          const text = removeWhitespaces($span.text()); // remove all white spaces
          expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,
            orderBy:[{field:"billing.address.zip",direction:DESC},{field:"company",direction:ASC}],locale:"en",userId:123){
            totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
        });
    });
  });

  describe('Translate by Language', () => {
    it('should Clear all Filters & Sorts', () => {
      cy.contains('Clear all Filter & Sorts').click();

      // wait for the query to finish
      cy.get('[data-test=status]').should('contain', 'finished');
    });

    it('should have English Column Titles in the grid after switching locale', () => {
      const expectedColumnTitles = ['Name', 'Gender', 'Company', 'Billing Address Zip', 'Billing Address Street', 'Date'];

      cy.get('#grid6')
        .find('.slick-header-left .slick-header-columns')
        .children()
        .each(($child, index) => expect($child.text()).to.eq(expectedColumnTitles[index]));
    });

    it('should have English Column Grouping Titles in the grid after switching locale', () => {
      const expectedGroupTitles = ['Customer Information', 'Billing Information'];
      cy.get('#grid6')
        .find('.slick-preheader-panel .slick-header-columns')
        .children()
        .each(($child, index) => expect($child.text()).to.eq(expectedGroupTitles[index]));
    });

    it('should hover over the "Title" column header menu and expect all commands be displayed in English', () => {
      cy.get('#grid6')
        .find('.slick-header-columns.slick-header-columns-left .slick-header-column')
        .first()
        .trigger('mouseover')
        .children('.slick-header-menu-button')
        .invoke('show')
        .click();

      cy.get('.slick-header-menu .slick-menu-command-list')
        .should('be.visible')
        .children('.slick-menu-item:nth-of-type(3)')
        .children('.slick-menu-content')
        .should('contain', 'Sort Ascending');

      cy.get('.slick-header-menu .slick-menu-command-list')
        .children('.slick-menu-item:nth-of-type(4)')
        .children('.slick-menu-content')
        .should('contain', 'Sort Descending');

      cy.get('.slick-header-menu .slick-menu-command-list')
        .children('.slick-menu-item:nth-of-type(6)')
        .children('.slick-menu-content')
        .should('contain', 'Remove Filter');

      cy.get('.slick-header-menu .slick-menu-command-list')
        .children('.slick-menu-item:nth-of-type(7)')
        .children('.slick-menu-content')
        .should('contain', 'Remove Sort');

      cy.get('.slick-header-menu .slick-menu-command-list')
        .children('.slick-menu-item:nth-of-type(8)')
        .children('.slick-menu-content')
        .should('contain', 'Hide Column');
    });

    it('should open the Grid Menu and expect all commands be displayed in English', () => {
      cy.get('#grid6')
        .find('button.slick-grid-menu-button')
        .trigger('click');

      cy.get('.slick-grid-menu .slick-menu-title:nth(0)')
        .contains('Commands');

      cy.get('.slick-grid-menu .slick-menu-item:nth(0) > span')
        .contains('Clear all Filters');

      cy.get('.slick-grid-menu .slick-menu-item:nth(1) > span')
        .contains('Clear all Sorting');

      cy.get('.slick-grid-menu .slick-menu-title:nth(1)')
        .contains('Columns');

      cy.get('.slick-column-picker-list li:nth(0)')
        .contains('Customer Information - Name');

      cy.get('.slick-column-picker-list li:nth(1)')
        .contains('Customer Information - Gender');

      cy.get('.slick-grid-menu [data-dismiss=slick-grid-menu].close')
        .click({ force: true });
    });

    it('should switch locale to French', () => {
      cy.get('[data-test=language-button]')
        .click();

      cy.get('[data-test=selected-locale]')
        .should('contain', 'fr.json');
    });

    it('should have French Column Titles in the grid after switching locale', () => {
      const expectedColumnTitles = ['Nom', 'Sexe', 'Compagnie', 'Code zip de facturation', 'Adresse de facturation', 'Date'];

      cy.get('#grid6')
        .find('.slick-header-left .slick-header-columns')
        .children()
        .each(($child, index) => expect($child.text()).to.eq(expectedColumnTitles[index]));
    });

    it('should have French Column Grouping Titles in the grid after switching locale', () => {
      const expectedGroupTitles = ['Information Client', 'Information de Facturation'];
      cy.get('#grid6')
        .find('.slick-preheader-panel .slick-header-columns')
        .children()
        .each(($child, index) => expect($child.text()).to.eq(expectedGroupTitles[index]));
    });

    it('should display Pagination in French', () => {
      cy.get('.slick-pagination-settings > span')
        .contains('éléments par page');

      cy.get('.page-info-from-to')
        .contains('de');

      cy.get('[data-test=item-from]')
        .contains('1');

      cy.get('[data-test=item-to]')
        .contains('30');

      cy.get('[data-test=total-items]')
        .contains('100');

      cy.get('.page-info-total-items')
        .contains('éléments');
    });

    it('should hover over the "Title" column header menu and expect all commands be displayed in French', () => {
      cy.get('#grid6')
        .find('.slick-header-columns.slick-header-columns-left .slick-header-column')
        .first()
        .trigger('mouseover')
        .children('.slick-header-menu-button')
        .invoke('show')
        .click();

      cy.get('.slick-header-menu .slick-menu-command-list')
        .should('be.visible')
        .children('.slick-menu-item:nth-of-type(3)')
        .children('.slick-menu-content')
        .should('contain', 'Trier par ordre croissant');

      cy.get('.slick-header-menu .slick-menu-command-list')
        .children('.slick-menu-item:nth-of-type(4)')
        .children('.slick-menu-content')
        .should('contain', 'Trier par ordre décroissant');

      cy.get('.slick-header-menu .slick-menu-command-list')
        .children('.slick-menu-item:nth-of-type(6)')
        .children('.slick-menu-content')
        .should('contain', 'Supprimer le filtre');

      cy.get('.slick-header-menu .slick-menu-command-list')
        .children('.slick-menu-item:nth-of-type(7)')
        .children('.slick-menu-content')
        .should('contain', 'Supprimer le tri');

      cy.get('.slick-header-menu .slick-menu-command-list')
        .children('.slick-menu-item:nth-of-type(8)')
        .children('.slick-menu-content')
        .should('contain', 'Cacher la colonne');
    });

    it('should open the Grid Menu and expect all commands be displayed in French', () => {
      cy.get('#grid6')
        .find('button.slick-grid-menu-button')
        .trigger('click');

      cy.get('.slick-grid-menu .slick-menu-title:nth(0)')
        .contains('Commandes');

      cy.get('.slick-grid-menu .slick-menu-item:nth(0) > span')
        .contains('Supprimer tous les filtres');

      cy.get('.slick-grid-menu .slick-menu-item:nth(1) > span')
        .contains('Supprimer tous les tris');

      cy.get('.slick-grid-menu .slick-menu-title:nth(1)')
        .contains('Colonnes');

      cy.get('.slick-grid-menu .slick-column-picker-list li:nth(0)')
        .contains('Information Client - Nom');

      cy.get('.slick-grid-menu .slick-column-picker-list li:nth(1)')
        .contains('Information Client - Sexe');

      cy.get('.slick-grid-menu [data-dismiss=slick-grid-menu].close')
        .click({ force: true });
    });

    it('should click on Set Dynamic Filter and expect query and filters to be changed', () => {
      cy.get('[data-test=set-dynamic-filter]')
        .click();

      cy.get('.search-filter.filter-name select')
        .should('have.value', 'a*')

      cy.get('.search-filter.filter-name')
        .find('input')
        .invoke('val')
        .then(text => expect(text).to.eq('Jane'));

      cy.get('.search-filter.filter-gender .ms-choice > span')
        .contains('Féminin');

      cy.get('.search-filter.filter-company .ms-choice > span')
        .contains('Acme');

      cy.get('.search-filter.filter-billingAddressZip select')
        .should('have.value', '>=')

      cy.get('.search-filter.filter-billingAddressZip')
        .find('input')
        .invoke('val')
        .then(text => expect(text).to.eq('11'));

      cy.get('.search-filter.filter-finish')
        .find('input')
        .invoke('val')
        .then(text => expect(text).to.eq(`${presetLowestDay} au ${presetHighestDay}`));

      // wait for the query to finish
      cy.get('[data-test=status]').should('contain', 'finished');

      cy.get('[data-test=graphql-query-result]')
        .should(($span) => {
          const text = removeWhitespaces($span.text()); // remove all white spaces
          expect(text).to.eq(removeWhitespaces(`query{users(first:30,offset:0,
            filterBy:[{field:"gender",operator:EQ,value:"female"},{field:"name",operator:StartsWith,value:"Jane"},
            {field:"company",operator:IN,value:"acme"},{field:"billing.address.zip",operator:GE,value:"11"},
            {field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}],locale:"fr",userId:123)
            {totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish}}}`));
        });
    });

    it('should have French Text inside some of the Filters', () => {
      cy.get('div.ms-filter.filter-gender')
        .trigger('click');

      cy.get('.ms-drop')
        .contains('Masculin') // use regexp to avoid finding first Task 3 which is in fact Task 399
        .click();

      cy.get('.search-filter.filter-gender .ms-choice > span')
        .contains('Masculin');

      cy.get('.flatpickr-input')
        .should('contain.value', 'au'); // date range will contains (y to z) or in French (y au z)
    });

    it('should switch locale to English', () => {
      cy.get('[data-test=language-button]')
        .click();

      cy.get('[data-test=selected-locale]')
        .should('contain', 'en.json');
    });
  });

  describe('Cursor Pagination', () => {
    it('should re-initialize grid for cursor pagination', () => {
      cy.get('[data-test="reset-presets"]').click(); // reset to same original presets
      cy.get('[data-test=cursor]').click();
      cy.wait(1);

      // the page number input should be a label now
      cy.get('[data-test=page-number-label]').should('exist').should('have.text', '1');
    });

    it('should change Pagination to the last page', () => {
      // Go to first page (if not already there)
      cy.get('[data-test=goto-first-page').click();

      cy.get('.icon-seek-end').click();

      // wait for the query to finish
      cy.get('[data-test=status]').should('contain', 'finished');
      cy.get('[data-test=graphql-query-result]')
        .should(($span) => {
          const text = removeWhitespaces($span.text()); // remove all white spaces
          expect(text).to.eq(removeWhitespaces(`query{users(last:20,
            orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
            filterBy:[
              {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
              {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
            ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish},pageInfo{hasNextPage,hasPreviousPage,endCursor,startCursor},edges{cursor}}}`));
        });
    });

    it('should change Pagination to the first page', () => {
      // Go to first page (if not already there)
      cy.get('[data-test=goto-last-page').click();

      cy.get('.icon-seek-first').click();

      // wait for the query to finish
      cy.get('[data-test=status]').should('contain', 'finished');
      cy.get('[data-test=graphql-query-result]')
        .should(($span) => {
          const text = removeWhitespaces($span.text()); // remove all white spaces
          expect(text).to.eq(removeWhitespaces(`query{users(first:20,
            orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
            filterBy:[
              {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
              {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
            ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish},pageInfo{hasNextPage,hasPreviousPage,endCursor,startCursor},edges{cursor}}}`));
        });
    });

    it('should change Pagination to next page and all the way to the last', () => {
      // Go to first page (if not already there)
      cy.get('[data-test=goto-first-page').click();
      cy.get('[data-test=status]').should('contain', 'finished');

      // on page 1, click 4 times to get to page 5 (the last page)
      cy.wrap([0, 1, 2, 3]).each((el, i) => {
        cy.wait(25); // Avoid clicking too fast and hitting race conditions because of the setTimeout in the example page (this timeout should be greater than in the page)
        cy.get('.icon-seek-next').click().then(() => {
          // wait for the query to finish
          cy.get('[data-test=status]').should('contain', 'finished');
          cy.get('[data-test=graphql-query-result]')
            .should(($span) => {
              // First page is A-B
              // first click is to get page after A-B
              // => get first 20 after 'B'
              const afterCursor = String.fromCharCode('B'.charCodeAt(0) + i);

              const text = removeWhitespaces($span.text()); // remove all white spaces
              expect(text).to.eq(removeWhitespaces(`query{users(first:20,after:"${afterCursor}",
                orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
                filterBy:[
                  {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
                  {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
                ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish},pageInfo{hasNextPage,hasPreviousPage,endCursor,startCursor},edges{cursor}}}`));
            });
        });
      });
    });

    it('should change Pagination from the last page all the way to the first', () => {
      // Go to last page (if not already there)
      cy.get('[data-test=goto-last-page').click();

      // on page 5 (last page), click 4 times to go to page 1
      cy.wrap([0, 1, 2, 3]).each((el, i) => {
        cy.wait(25); // Avoid clicking too fast and hitting race conditions because of the setTimeout in the example page (this timeout should be greater than in the page)
        cy.get('.icon-seek-prev').click().then(() => {
          // wait for the query to finish
          cy.get('[data-test=status]').should('contain', 'finished');
          cy.get('[data-test=graphql-query-result]')
            .should(($span) => {
              // Last page is E-F
              // first click is to get page before E-F
              // => get last 20 before 'E'
              const beforeCursor = String.fromCharCode('E'.charCodeAt(0) - i);

              const text = removeWhitespaces($span.text()); // remove all white spaces
              expect(text).to.eq(removeWhitespaces(`query{users(last:20,before:"${beforeCursor}",
                orderBy:[{field:"name",direction:ASC},{field:"company",direction:DESC}],
                filterBy:[
                  {field:"gender",operator:EQ,value:"male"},{field:"name",operator:Contains,value:"JohnDoe"},
                  {field:"company",operator:IN,value:"xyz"},{field:"finish",operator:GE,value:"${presetLowestDay}"},{field:"finish",operator:LE,value:"${presetHighestDay}"}
                ],locale:"en",userId:123){totalCount,nodes{id,name,gender,company,billing{address{street,zip}},finish},pageInfo{hasNextPage,hasPreviousPage,endCursor,startCursor},edges{cursor}}}`));
            });
        });
      });
    });
  });
});
