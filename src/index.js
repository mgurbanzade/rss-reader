import 'bootstrap';
import './assets/index.scss';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import validator from 'validator';
import generateFeedObject from './utils';
import { presentFeed, presentForm, presentSubmitBtn } from './presenters';

const state = {
  currentState: [],
  addedFeedLinks: [],
  urlIsValid: null,
  loadingResponse: false,
};

const submitBtn = document.querySelector('#submitBtn');
const inputField = document.querySelector('#inputField');
const CORSproxy = 'https://cors-anywhere.herokuapp.com';

submitBtn.addEventListener('click', () => {
  const inputValue = inputField.value;
  const parser = new DOMParser();

  if (inputValue.length === 0) return;

  state.loadingResponse = true;

  axios.get(`${CORSproxy}/${inputValue}`).then((response) => {
    const responseData = response.data;
    const xmlDocument = parser.parseFromString(responseData, 'application/xml');
    state.currentState = [...state.currentState, generateFeedObject(xmlDocument)];
    state.addedFeedLinks = [...state.addedFeedLinks, inputValue];
    state.loadingResponse = false;
  }).catch(() => {
    state.loadingResponse = false;
    alert('Something went wrong :(');
  });
});


inputField.addEventListener('input', (e) => {
  const isValidURL = validator.isURL(e.target.value);
  const isNotDuplicateURL = !state.addedFeedLinks.includes(e.target.value);
  state.urlIsValid = isValidURL && isNotDuplicateURL;
});

WatchJS.watch(state, 'currentState', () => presentFeed(state.currentState));
WatchJS.watch(state, 'urlIsValid', () => presentForm(state.urlIsValid));
WatchJS.watch(state, 'loadingResponse', () => presentSubmitBtn(state.loadingResponse));
