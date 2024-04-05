import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SlickCustomTooltip } from '@slickgrid-universal/custom-tooltip-plugin';
import { ExcelExportService } from '@slickgrid-universal/excel-export';
import { CustomInputFilter } from './custom-inputFilter';
import {
  AngularGridInstance,
  Column,
  FieldType,
  Filters,
  Formatter,
  Formatters,
  GridOption,
  GridStateChange,
  Metrics,
  MultipleSelectOption,
  OperatorType,
  SliderRangeOption,
  unsubscribeAllObservables,
} from '../modules/angular-slickgrid';
import moment from 'moment-tiny';
import { Subscription } from 'rxjs';

const NB_ITEMS = 1500;

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// create a custom translate Formatter (typically you would move that a separate file, for separation of concerns)
const taskTranslateFormatter: Formatter = (row, cell, value, columnDef, dataContext, grid) => {
  const gridOptions = grid.getOptions() as GridOption;
  const translate = gridOptions.i18n as TranslateService;

  return translate.instant('TASK_X', { x: value });
};

@Component({
  templateUrl: './grid-range.component.html'
})
export class GridRangeComponent implements OnInit, OnDestroy {
  title = 'Example 25: Filtering from Range of Search Values';
  subTitle = `
  This demo shows how to use Filters with Range of Search Values (<a href="https://ghiscoding.gitbook.io/angular-slickgrid/column-functionalities/filters/range-filters" target="_blank">Wiki docs</a>)
  <br/>
    <ul class="small">
      <li>All input filters support the following operators: (>, >=, <, <=, <>, !=, =, ==, *) and now also the (..) for an input range</li>
      <li>All filters (which support ranges) can be defined via the 2 dots (..) which represents a range, this also works for dates and slider in the "presets"</li>
      <ul>
        <li>For a numeric range defined in an input filter (must be of type text), you can use 2 dots (..) to represent a range</li>
        <li>example: typing "10..90" will filter values between 10 and 90 (but excluding the number 10 and 90)</li>
      </ul>
      <ul>
        <li>note that the examples shown below for the operator, are case sensitive</li>
        <li>by default the range is inclusive which would be the same as defining the filter options to "operator: 'RangeInclusive'" or "operator: OperatoryType.rangeInclusive"</li>
        <li>you can also set the inverse (exclusive) by defining the filter options to "operator: 'RangeExclusive'" or "operator: OperatoryType.rangeExclusive"</li>
      </ul>
      <li>Date Range with Flatpickr Date Picker, they will also use the locale, choose a start date then drag or click on the end date</li>
    </ul>
  `;
  private subscriptions: Subscription[] = [];
  angularGrid!: AngularGridInstance;
  columnDefinitions!: Column[];
  gridOptions!: GridOption;
  dataset!: any[];
  selectedLanguage: string;
  metrics!: Metrics;
  filterList = [
    { value: '', label: '' },
    { value: 'currentYearTasks', label: 'Current Year Completed Tasks' },
    { value: 'nextYearTasks', label: 'Next Year Active Tasks' }
  ];
  selectedPredefinedFilter!: { value: string; label: string; };

  constructor(private translate: TranslateService) {
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
        id: 'title', name: 'Title', field: 'id', nameKey: 'TITLE', minWidth: 100,
        formatter: taskTranslateFormatter,
        sortable: true,
        filterable: true,
        params: { useFormatterOuputToFilter: true }
      },
      {
        id: 'description', name: 'Description', field: 'description', filterable: true, sortable: true, minWidth: 80,
        type: FieldType.string,
        filter: {
          model: CustomInputFilter, // create a new instance to make each Filter independent from each other
          enableTrimWhiteSpace: true // or use global "enableFilterTrimWhiteSpace" to trim on all Filters
        }
      },
      {
        id: 'percentComplete', name: '% Complete', field: 'percentComplete', nameKey: 'PERCENT_COMPLETE', minWidth: 120,
        sortable: true,
        customTooltip: { position: 'center' },
        formatter: Formatters.progressBar,
        type: FieldType.number,
        filterable: true,
        filter: {
          model: Filters.sliderRange,
          maxValue: 100, // or you can use the filterOptions as well
          operator: OperatorType.rangeInclusive, // defaults to inclusive
          filterOptions: {
            hideSliderNumbers: false, // you can hide/show the slider numbers on both side
            min: 0, step: 5
          } as SliderRangeOption
        }
      },
      {
        id: 'start', name: 'Start', field: 'start', nameKey: 'START', formatter: Formatters.dateIso, sortable: true, minWidth: 75, width: 100, exportWithFormatter: true,
        type: FieldType.date, filterable: true, filter: { model: Filters.compoundDate }
      },
      {
        id: 'finish', name: 'Finish', field: 'finish', nameKey: 'FINISH', formatter: Formatters.dateIso, sortable: true, minWidth: 75, width: 120, exportWithFormatter: true,
        type: FieldType.date,
        filterable: true,
        filter: {
          model: Filters.dateRange,
        }
      },
      {
        id: 'duration', field: 'duration', nameKey: 'DURATION', maxWidth: 90,
        type: FieldType.number,
        sortable: true,
        filterable: true, filter: {
          model: Filters.input,
          operator: OperatorType.rangeExclusive // defaults to inclusive
        }
      },
      {
        id: 'completed', name: 'Completed', field: 'completed', nameKey: 'COMPLETED', minWidth: 85, maxWidth: 90,
        formatter: Formatters.checkmark,
        exportWithFormatter: true, // you can set this property in the column definition OR in the grid options, column def has priority over grid options
        filterable: true,
        filter: {
          collection: [{ value: '', label: '' }, { value: true, label: 'True' }, { value: false, label: 'False' }],
          model: Filters.singleSelect,
          filterOptions: { autoAdjustDropHeight: true } as MultipleSelectOption
        }
      }
    ];

    const today = new Date();
    const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
    const presetHighestDay = moment().add(today.getDate() < 14 ? 30 : 25, 'days').format('YYYY-MM-DD');

    this.gridOptions = {
      autoResize: {
        container: '#demo-container',
        rightPadding: 10
      },
      enableExcelCopyBuffer: true,
      enableFiltering: true,
      // enableFilterTrimWhiteSpace: true,
      enableTranslate: true,
      i18n: this.translate,

      // use columnDef searchTerms OR use presets as shown below
      presets: {
        filters: [
          //  you can use the 2 dots separator on all Filters which support ranges
          { columnId: 'duration', searchTerms: ['4..88'] },
          // { columnId: 'percentComplete', searchTerms: ['5..80'] }, // without operator will default to 'RangeExclusive'
          // { columnId: 'finish', operator: 'RangeInclusive', searchTerms: [`${presetLowestDay}..${presetHighestDay}`] },

          // or you could also use 2 searchTerms values, instead of using the 2 dots (only works with SliderRange & DateRange Filters)
          // BUT make sure to provide the operator, else the filter service won't know that this is really a range
          { columnId: 'percentComplete', operator: 'RangeInclusive', searchTerms: [5, 80] }, // same result with searchTerms: ['5..80']
          { columnId: 'finish', operator: 'RangeInclusive', searchTerms: [presetLowestDay, presetHighestDay] },
        ],
        sorters: [
          { columnId: 'percentComplete', direction: 'DESC' },
          { columnId: 'duration', direction: 'ASC' },
        ],
      },
      externalResources: [new SlickCustomTooltip(), new ExcelExportService()],
    };

    // mock a dataset
    this.dataset = this.mockData(NB_ITEMS);
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
  }

  mockData(itemCount: number, startingIndex = 0): any[] {
    // mock a dataset
    const tempDataset = [];
    for (let i = startingIndex; i < (startingIndex + itemCount); i++) {
      const randomDuration = randomBetween(0, 365);
      const randomYear = randomBetween(moment().year(), moment().year() + 1);
      const randomMonth = randomBetween(0, 12);
      const randomDay = randomBetween(10, 28);
      const randomPercent = randomBetween(0, 100);

      tempDataset.push({
        id: i,
        title: 'Task ' + i,
        description: (i % 5) ? 'desc ' + i : null, // also add some random to test NULL field
        duration: randomDuration,
        percentComplete: randomPercent,
        percentCompleteNumber: randomPercent,
        start: (i % 4) ? null : new Date(randomYear, randomMonth, randomDay),          // provide a Date format
        finish: new Date(randomYear, randomMonth, randomDay),
        completed: (randomPercent === 100) ? true : false,
      });
    }

    return tempDataset;
  }

  clearFilters() {
    this.selectedPredefinedFilter = { value: '', label: '' };
    this.angularGrid.filterService.clearFilters();
  }

  /** Dispatched event of a Grid State Changed event */
  gridStateChanged(gridState: GridStateChange) {
    console.log('Client sample, Grid State changed:: ', gridState);
  }

  /** Save current Filters, Sorters in LocaleStorage or DB */
  saveCurrentGridState() {
    console.log('Client sample, last Grid State:: ', this.angularGrid.gridStateService.getCurrentGridState());
  }

  refreshMetrics(_e: Event, args: any) {
    if (args && args.current >= 0) {
      setTimeout(() => {
        this.metrics = {
          startTime: new Date(),
          itemCount: args && args.current || 0,
          totalItemCount: this.dataset.length || 0
        };
      });
    }
  }

  setFiltersDynamically() {
    const presetLowestDay = moment().add(-5, 'days').format('YYYY-MM-DD');
    const presetHighestDay = moment().add(25, 'days').format('YYYY-MM-DD');

    // we can Set Filters Dynamically (or different filters) afterward through the FilterService
    this.angularGrid.filterService.updateFilters([
      { columnId: 'duration', searchTerms: ['14..78'], operator: 'RangeInclusive' },
      { columnId: 'percentComplete', operator: 'RangeExclusive', searchTerms: [15, 85] },
      { columnId: 'finish', operator: 'RangeInclusive', searchTerms: [presetLowestDay, presetHighestDay] },
    ]);
  }

  setSortingDynamically() {
    this.angularGrid.sortService.updateSorting([
      // orders matter, whichever is first in array will be the first sorted column
      { columnId: 'finish', direction: 'DESC' },
      { columnId: 'percentComplete', direction: 'ASC' },
    ]);
  }

  usePredefinedFilter(filterValue: string) {
    let filters: any[] = [];
    const currentYear = moment().year();

    switch (filterValue) {
      case 'currentYearTasks':
        filters = [
          { columnId: 'finish', operator: OperatorType.rangeInclusive, searchTerms: [`${currentYear}-01-01`, `${currentYear}-12-31`] },
          { columnId: 'completed', operator: OperatorType.equal, searchTerms: [true] },
        ];
        break;
      case 'nextYearTasks':
        filters = [{ columnId: 'start', operator: '>=', searchTerms: [`${currentYear + 1}-01-01`] }];
        break;
    }
    this.angularGrid.filterService.updateFilters(filters);
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
