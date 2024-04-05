import { GraphqlService, GraphqlPaginatedResult, GraphqlServiceApi, GraphqlServiceOption, } from '@slickgrid-universal/graphql';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AngularGridInstance,
  Column,
  CursorPageInfo,
  FieldType,
  Filters,
  Formatters,
  GridOption,
  GridStateChange,
  Metrics,
  MultipleSelectOption,
  OperatorType,
  SortDirection,
  unsubscribeAllObservables,
} from './../modules/angular-slickgrid';
import moment from 'moment-tiny';
import { Subscription } from 'rxjs';

const defaultPageSize = 20;
const GRAPHQL_QUERY_DATASET_NAME = 'users';
const LOCAL_STORAGE_KEY = 'gridStateGraphql';
const FAKE_SERVER_DELAY = 250;

@Component({
  templateUrl: './grid-graphql.component.html'
})
export class GridGraphqlComponent implements OnInit, OnDestroy {
  title = 'Example 6: Grid connected to Backend Server with GraphQL';
  subTitle = `
    Sorting/Paging connected to a Backend GraphQL Service (<a href="https://ghiscoding.gitbook.io/angular-slickgrid/backend-services/graphql" target="_blank">Wiki docs</a>).
    <br/>
    <ul class="small">
      <li><span class="red">(*) NO DATA SHOWING</span> - just change Filters &amp; Pages and look at the "GraphQL Query" changing :)</li>
      <li>This example also demos the Grid State feature, open the console log to see the changes</li>
      <li>String column also support operator (>, >=, <, <=, <>, !=, =, ==, *)
      <ul>
        <li>The (*) can be used as startsWith (ex.: "abc*" => startsWith "abc") / endsWith (ex.: "*xyz" => endsWith "xyz")</li>
        <li>The other operators can be used on column type number for example: ">=100" (bigger or equal than 100)</li>
      </ul>
      <li>You can also preload a grid with certain "presets" like Filters / Sorters / Pagination <a href="https://ghiscoding.gitbook.io/angular-slickgrid/grid-functionalities/grid-state-and-preset" target="_blank">Wiki - Grid Preset</a>
    </ul>
  `;
  private subscriptions: Subscription[] = [];
  angularGrid!: AngularGridInstance;
  columnDefinitions!: Column[];
  gridOptions!: GridOption;
  dataset = [];
  metrics!: Metrics;

  isWithCursor = false;
  graphqlQuery = '';
  processing = true;
  status = { text: 'processing...', class: 'alert alert-danger' };
  selectedLanguage: string;
  serverWaitDelay = FAKE_SERVER_DELAY; // server simulation with default of 250ms but 50ms for Cypress tests

  constructor(private readonly cd: ChangeDetectorRef, private translate: TranslateService) {
    // always start with English for Cypress E2E tests to be consistent
    const defaultLang = 'en';
    this.translate.use(defaultLang);
    this.selectedLanguage = defaultLang;
  }

  ngOnDestroy() {
    // also unsubscribe all Angular Subscriptions
    unsubscribeAllObservables(this.subscriptions);
  }

  ngOnInit(): void {
    this.columnDefinitions = [
      {
        id: 'name', field: 'name', nameKey: 'NAME', width: 60, columnGroupKey: 'CUSTOMER_INFORMATION',
        type: FieldType.string,
        sortable: true,
        filterable: true,
        filter: {
          model: Filters.compoundInput
        }
      },
      {
        id: 'gender', field: 'gender', nameKey: 'GENDER', filterable: true, sortable: true, width: 60, columnGroupKey: 'CUSTOMER_INFORMATION',
        filter: {
          model: Filters.singleSelect,
          collection: [{ value: '', label: '' }, { value: 'male', label: 'male', labelKey: 'MALE' }, { value: 'female', label: 'female', labelKey: 'FEMALE' }]
        }
      },
      {
        id: 'company', field: 'company', nameKey: 'COMPANY', width: 60, columnGroupKey: 'CUSTOMER_INFORMATION',
        sortable: true, filterable: true,
        filter: {
          model: Filters.multipleSelect,
          collection: [{ value: 'acme', label: 'Acme' }, { value: 'abc', label: 'Company ABC' }, { value: 'xyz', label: 'Company XYZ' }],
          filterOptions: {
            filter: true // adds a filter on top of the multi-select dropdown
          } as MultipleSelectOption
        }
      },
      {
        id: 'billingAddressStreet', field: 'billing.address.street', nameKey: 'BILLING.ADDRESS.STREET',
        width: 60, filterable: true, sortable: true, columnGroupKey: 'BILLING.INFORMATION',
      },
      {
        id: 'billingAddressZip', field: 'billing.address.zip', nameKey: 'BILLING.ADDRESS.ZIP', width: 60,
        type: FieldType.number,
        columnGroupKey: 'BILLING.INFORMATION', // or use "columnGroup" without Translate
        filterable: true, sortable: true,
        filter: {
          model: Filters.compoundInput
        },
        formatter: Formatters.multiple, params: { formatters: [Formatters.complexObject, Formatters.translate] }
      },
      {
        id: 'finish', field: 'finish', name: 'Date', formatter: Formatters.dateIso, sortable: true, minWidth: 90, width: 120, exportWithFormatter: true,
        type: FieldType.date,
        columnGroupKey: 'BILLING.INFORMATION', // or use "columnGroup" without Translate
        filterable: true,
        filter: {
          model: Filters.dateRange,
        }
      },
    ];

    const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
    const presetHighestDay = moment().add(20, 'days').format('YYYY-MM-DD');

    this.gridOptions = {
      gridHeight: 200,
      gridWidth: 900,
      enableFiltering: true,
      enableCellNavigation: true,
      enableTranslate: true,
      createPreHeaderPanel: true,
      showPreHeaderPanel: true,
      preHeaderPanelHeight: 28,
      i18n: this.translate,
      gridMenu: {
        resizeOnShowHeaderRow: true,
        commandItems: [
          {
            iconCssClass: 'fa fa-times text-danger',
            title: 'Reset Grid',
            disabled: false,
            command: 'reset-grid',
            positionOrder: 60
          }
        ],
        onCommand: (e, args) => {
          if (args.command === 'reset-grid') {
            this.angularGrid.gridService.resetGrid(this.columnDefinitions);
            localStorage[LOCAL_STORAGE_KEY] = null;
          }
        }
      },
      enablePagination: true, // you could optionally disable the Pagination
      pagination: {
        pageSizes: [10, 15, 20, 25, 30, 40, 50, 75, 100],
        pageSize: defaultPageSize,
        totalItems: 0
      },
      presets: {
        columns: [
          { columnId: 'name', width: 100 },
          { columnId: 'gender', width: 55 },
          { columnId: 'company' },
          { columnId: 'billingAddressZip' }, // flip column position of Street/Zip to Zip/Street
          { columnId: 'billingAddressStreet', width: 120 },
          { columnId: 'finish', width: 130 },
        ],
        filters: [
          // you can use OperatorType or type them as string, e.g.: operator: 'EQ'
          { columnId: 'gender', searchTerms: ['male'], operator: OperatorType.equal },
          { columnId: 'name', searchTerms: ['John Doe'], operator: OperatorType.contains },
          { columnId: 'company', searchTerms: ['xyz'], operator: 'IN' },

          // use a date range with 2 searchTerms values
          { columnId: 'finish', searchTerms: [presetLowestDay, presetHighestDay], operator: OperatorType.rangeInclusive },
        ],
        sorters: [
          // direction can written as 'asc' (uppercase or lowercase) and/or use the SortDirection type
          { columnId: 'name', direction: 'asc' },
          { columnId: 'company', direction: SortDirection.DESC }
        ],
        pagination: { pageNumber: this.isWithCursor ? 1 : 2, pageSize: 20 } // if cursor based, start at page 1
      },
      backendServiceApi: {
        service: new GraphqlService(),
        options: {
          datasetName: GRAPHQL_QUERY_DATASET_NAME, // the only REQUIRED property
          addLocaleIntoQuery: true,   // optionally add current locale into the query
          extraQueryArguments: [{     // optionally add some extra query arguments as input query arguments
            field: 'userId',
            value: 123
          }],
          useCursor: this.isWithCursor, // sets pagination strategy, if true requires a call to setPageInfo() when graphql call returns
          // when dealing with complex objects, we want to keep our field name with double quotes
          // example with gender: query { users (orderBy:[{field:"gender",direction:ASC}]) {}
          keepArgumentFieldDoubleQuotes: true
        },
        // you can define the onInit callback OR enable the "executeProcessCommandOnInit" flag in the service init
        // onInit: (query) => this.getCustomerApiCall(query)
        preProcess: () => this.displaySpinner(true),
        process: (query) => this.getCustomerApiCall(query),
        postProcess: (result: GraphqlPaginatedResult) => {
          this.metrics = result.metrics as Metrics;
          this.displaySpinner(false);
          this.cd.detectChanges();
        }
      } as GraphqlServiceApi
    };
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
  }

  displaySpinner(isProcessing: boolean) {
    this.processing = isProcessing;
    this.status = (isProcessing)
      ? { text: 'processing...', class: 'alert alert-danger' }
      : { text: 'finished', class: 'alert alert-success' };
  }

  /**
   * Calling your GraphQL backend server should always return a Promise or Observable of type GraphqlPaginatedResult (or GraphqlResult without Pagination)
   * @param query
   * @return Promise<GraphqlPaginatedResult> | Observable<GraphqlResult>
   */
  getCustomerApiCall(_query: string): Promise<GraphqlPaginatedResult> {
    let pageInfo: CursorPageInfo;
    if (this.angularGrid?.paginationService) {
      const { paginationService } = this.angularGrid;
      // there seems to a timing issue where when you click "cursor" it requests the data before the pagination-service is initialized...
      const pageNumber = (paginationService as any)._initialized ? paginationService.getCurrentPageNumber() : 1;
      // In the real world, each node item would be A,B,C...AA,AB,AC, etc and so each page would actually be something like A-T, T-AN
      // but for this mock data it's easier to represent each page as
      // Page1: A-B
      // Page2: B-C
      // Page3: C-D
      // Page4: D-E
      // Page5: E-F
      const startCursor = String.fromCharCode('A'.charCodeAt(0) + pageNumber - 1);
      const endCursor = String.fromCharCode(startCursor.charCodeAt(0) + 1);
      pageInfo = {
        hasPreviousPage: paginationService.dataFrom === 0,
        hasNextPage: paginationService.dataTo === 100,
        startCursor,
        endCursor
      };
    } else {
      pageInfo = {
        hasPreviousPage: false,
        hasNextPage: true,
        startCursor: 'A',
        endCursor: 'B'
      };
    }

    // in your case, you will call your WebAPI function (wich needs to return a Promise)
    // for the demo purpose, we will call a mock WebAPI function
    const mockedResult = {
      // the dataset name is the only unknown property
      // will be the same defined in your GraphQL Service init, in our case GRAPHQL_QUERY_DATASET_NAME
      data: {
        [GRAPHQL_QUERY_DATASET_NAME]: {
          nodes: [],
          totalCount: 100,
          pageInfo
        }
      }
    };

    return new Promise(resolve => {
      setTimeout(() => {
        this.graphqlQuery = this.angularGrid.backendService!.buildQuery();
        if (this.isWithCursor) {
          // When using cursor pagination, the pagination service needs to be updated with the PageInfo data from the latest request
          // This might be done automatically if using a framework specific slickgrid library
          // Note because of this timeout, this may cause race conditions with rapid clicks!
          this.angularGrid?.paginationService?.setCursorPageInfo((mockedResult.data[GRAPHQL_QUERY_DATASET_NAME].pageInfo));
        }
        resolve(mockedResult);
      }, this.serverWaitDelay);
    });
  }

  goToFirstPage() {
    this.angularGrid.paginationService!.goToFirstPage();
  }

  goToLastPage() {
    this.angularGrid.paginationService!.goToLastPage();
  }

  /** Dispatched event of a Grid State Changed event */
  gridStateChanged(gridStateChanges: GridStateChange) {
    console.log('GraphQL Example, Grid State changed:: ', gridStateChanges);
    localStorage[LOCAL_STORAGE_KEY] = JSON.stringify(gridStateChanges.gridState);
  }

  clearAllFiltersAndSorts() {
    if (this.angularGrid?.gridService) {
      this.angularGrid.gridService.clearAllFiltersAndSorts();
    }
  }

  /** Save current Filters, Sorters in LocaleStorage or DB */
  saveCurrentGridState() {
    console.log('GraphQL current grid state', this.angularGrid.gridStateService.getCurrentGridState());
  }

  setFiltersDynamically() {
    const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
    const presetHighestDay = moment().add(20, 'days').format('YYYY-MM-DD');

    // we can Set Filters Dynamically (or different filters) afterward through the FilterService
    this.angularGrid.filterService.updateFilters([
      { columnId: 'gender', searchTerms: ['female'], operator: OperatorType.equal },
      { columnId: 'name', searchTerms: ['Jane'], operator: OperatorType.startsWith },
      { columnId: 'company', searchTerms: ['acme'], operator: 'IN' },
      { columnId: 'billingAddressZip', searchTerms: ['11'], operator: OperatorType.greaterThanOrEqual },
      { columnId: 'finish', searchTerms: [presetLowestDay, presetHighestDay], operator: OperatorType.rangeInclusive },
    ]);
  }

  setSortingDynamically() {
    this.angularGrid.sortService.updateSorting([
      // orders matter, whichever is first in array will be the first sorted column
      { columnId: 'billingAddressZip', direction: 'DESC' },
      { columnId: 'company', direction: 'ASC' },
    ]);
  }

  resetToOriginalPresets() {
    const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
    const presetHighestDay = moment().add(20, 'days').format('YYYY-MM-DD');

    this.angularGrid.filterService.updateFilters([
      // you can use OperatorType or type them as string, e.g.: operator: 'EQ'
      { columnId: 'gender', searchTerms: ['male'], operator: OperatorType.equal },
      { columnId: 'name', searchTerms: ['John Doe'], operator: OperatorType.contains },
      { columnId: 'company', searchTerms: ['xyz'], operator: 'IN' },

      // use a date range with 2 searchTerms values
      { columnId: 'finish', searchTerms: [presetLowestDay, presetHighestDay], operator: OperatorType.rangeInclusive },
    ]);
    this.angularGrid.sortService.updateSorting([
      // direction can written as 'asc' (uppercase or lowercase) and/or use the SortDirection type
      { columnId: 'name', direction: 'asc' },
      { columnId: 'company', direction: SortDirection.DESC }
    ]);
    setTimeout(() => {
      this.angularGrid.paginationService?.changeItemPerPage(20);
      this.angularGrid.paginationService?.goToPageNumber(2);
    });
  }

  setIsWithCursor(isWithCursor: boolean) {
    this.isWithCursor = isWithCursor;
    this.resetOptions({ useCursor: this.isWithCursor });
    return true;
  }

  private resetOptions(options: Partial<GraphqlServiceOption>) {
    const graphqlService = this.gridOptions.backendServiceApi!.service as GraphqlService;
    this.angularGrid.paginationService!.setCursorBased(options.useCursor as boolean);
    graphqlService.updateOptions(options);
    this.gridOptions = { ...this.gridOptions };
    this.angularGrid.paginationService?.goToFirstPage();
  }

  switchLanguage() {
    const nextLanguage = (this.selectedLanguage === 'en') ? 'fr' : 'en';
    this.subscriptions.push(
      this.translate.use(nextLanguage).subscribe(() => {
        this.selectedLanguage = nextLanguage;
      })
    );
  }
}
