import $ from 'jquery';
import axios from 'axios';
import validator from 'validator';
import { watch } from 'melanke-watchjs';
import { generateFeedObject, parseRSSFeed } from './utils';
import { presentFeed, presentForm, presentRequestState } from './presenters';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default () => {
  const state = {
    parsedFeedObjects: [],
    addedFeedLinks: [],
    urlState: null,
    requestState: null,
  };

  const feedEl = document.querySelector('#feedAccordion');
  const spinnerEl = document.querySelector('#loadingSpinner');
  const submitBtn = document.querySelector('#submitBtn');
  const inputField = document.querySelector('#inputField');
  const CORSproxy = 'https://cors-anywhere.herokuapp.com';

  submitBtn.addEventListener('click', () => {
    const inputValue = inputField.value;
    const requestLink = `${CORSproxy}/${inputValue}`;
    if (inputValue.length === 0) return;

    state.requestState = 'isProcessing';
    axios.get(requestLink).then((response) => {
      const xmlDocument = parseRSSFeed(response.data);
      state.parsedFeedObjects = [
        ...state.parsedFeedObjects, generateFeedObject(xmlDocument),
      ];
      state.addedFeedLinks = [...state.addedFeedLinks, inputValue];
      state.requestState = 'succeed';
    }).catch(() => {
      state.requestState = 'failed';
    });
  });

  inputField.addEventListener('input', (e) => {
    const isValidURL = validator.isURL(e.target.value);
    const isNotDuplicateURL = !state.addedFeedLinks.includes(e.target.value);
    state.urlState = isValidURL && isNotDuplicateURL ? 'valid' : 'invalid';
  });

  $('#modalWindow').on('show.bs.modal', (event) => {
    const descriptionBody = $(event.relatedTarget).data('whatever');
    $('#modalWindow').find('.modal-body p').text(descriptionBody);
  });

  watch(state, 'parsedFeedObjects', () => presentFeed(state.parsedFeedObjects, feedEl, inputField));
  watch(state, 'urlState', () => presentForm(state.urlState, inputField, submitBtn));
  watch(state, 'requestState', () => presentRequestState(state.requestState, submitBtn, spinnerEl));
};
