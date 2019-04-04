import 'bootstrap';
import './styles/index.scss';
import axios from 'axios';
import $ from 'jquery';
import { watch, callWatchers } from 'melanke-watchjs';
import validator from 'validator';
import { generateFeedObject, parseRSSFeed } from './utils';
import {
  presentFeed, presentForm, presentSubmitBtn, presentError,
} from './presenters';

const defaultState = {
  parsedFeedObjects: [],
  addedFeedLinks: [],
  urlIsValid: null,
  requestState: {
    isProcessing: false,
    failed: false,
  },
};

const run = (state = defaultState) => {
  const submitBtn = document.querySelector('#submitBtn');
  const inputField = document.querySelector('#inputField');
  const CORSproxy = 'https://cors-anywhere.herokuapp.com';

  submitBtn.addEventListener('click', () => {
    const inputValue = inputField.value;
    if (inputValue.length === 0) return;

    state.requestState.isProcessing = true;

    axios.get(`${CORSproxy}/${inputValue}`).then((response) => {
      const responseData = response.data;
      const xmlDocument = parseRSSFeed(responseData, 'application/xml');
      state.parsedFeedObjects = [...state.parsedFeedObjects, generateFeedObject(xmlDocument)];
      state.addedFeedLinks = [...state.addedFeedLinks, inputValue];
      state.requestState.isProcessing = false;
    }).catch(() => {
      state.requestState.isProcessing = false;

      if (state.requestState.failed) {
        callWatchers(state.requestState, 'failed');
      } else {
        state.requestState.failed = true;
      }
    });
  });


  inputField.addEventListener('input', (e) => {
    const isValidURL = validator.isURL(e.target.value);
    const isNotDuplicateURL = !state.addedFeedLinks.includes(e.target.value);
    state.urlIsValid = isValidURL && isNotDuplicateURL;
  });

  $('#modalWindow').on('show.bs.modal', (event) => {
    const descriptionBody = $(event.relatedTarget).data('whatever');
    $('#modalWindow').find('.modal-body p').text(descriptionBody);
  });


  watch(state, 'parsedFeedObjects', () => presentFeed(state.parsedFeedObjects));
  watch(state, 'urlIsValid', () => presentForm(state.urlIsValid));
  watch(state.requestState, 'isProcessing', () => presentSubmitBtn(state.requestState.isProcessing));
  watch(state.requestState, 'failed', () => presentError());
};

run();
