import '../favicon.ico';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import axios from 'axios';
import validator from 'validator';
import { watch } from 'melanke-watchjs';
import {
  generateChannelObject, generateNewsObject, parseRSSFeed, getHotNewsItems,
} from './utils';
import {
  renderChannels, renderNews, renderForm, renderRequestState, renderModalState,
} from './renderers';

export default () => {
  const state = {
    parsedChannels: [],
    parsedNews: [],
    addedFeedLinks: [],
    urlState: null,
    requestState: null,
    modalState: {
      title: null,
      description: null,
    },
  };

  const tabsContainer = document.querySelector('#v-pills-tab');
  const tabItemsContainer = document.querySelector('#v-pills-tabContent');
  const spinnerEl = document.querySelector('#loadingSpinner');
  const submitBtn = document.querySelector('#submitBtn');
  const inputField = document.querySelector('#inputField');
  const modalWindow = $(document).find('#modalWindow');
  const CORSproxy = 'https://cors-anywhere.herokuapp.com';
  const defaultUpdateTimeMs = 5000;

  submitBtn.addEventListener('click', () => {
    const inputValue = inputField.value;
    const requestLink = `${CORSproxy}/${inputValue}`;
    if (inputValue.length === 0) return;

    state.requestState = 'isProcessing';
    axios.get(requestLink).then((response) => {
      const xmlDocument = parseRSSFeed(response.data);
      state.parsedChannels = [
        ...state.parsedChannels, generateChannelObject(xmlDocument),
      ];
      state.parsedNews = state.parsedNews.concat(generateNewsObject(xmlDocument));
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

  modalWindow.on('show.bs.modal', (event) => {
    const targetTitle = $(event.relatedTarget).siblings('a').text();
    const targetDescr = $(event.relatedTarget).siblings('.item-description').html();
    state.modalState.title = targetTitle;
    state.modalState.description = targetDescr;
  });

  const lookForUpdates = (interval = defaultUpdateTimeMs) => {
    setTimeout(() => {
      const promises = state.addedFeedLinks.map(link => axios.get(`${CORSproxy}/${link}`));

      Promise.all(promises).then((responses) => {
        const parsedResponses = getHotNewsItems(responses);
        const latestItems = parsedResponses.reduce((acc, itemsArray) => {
          const sortByDate = (a, b) => (a.pubDate > b.pubDate ? -1 : a.pubDate < b.pubDate ? 1 : 0);
          const currLatestUpdateTime = state.parsedNews
            .filter(parsedItem => parsedItem.channelId === itemsArray[0].channelId)
            .sort(sortByDate)[0].pubDate;
          return [...acc, itemsArray.filter(item => item.pubDate > currLatestUpdateTime)];
        }, []);

        state.parsedNews = latestItems.flat().concat(state.parsedNews);
      }).finally(lookForUpdates);
    }, interval);
  };

  lookForUpdates();

  watch(state, 'parsedChannels', () => renderChannels(state.parsedChannels, tabsContainer, inputField));
  watch(state, 'parsedNews', () => renderNews(state.parsedNews, tabItemsContainer));
  watch(state, 'urlState', () => renderForm(state.urlState, inputField, submitBtn));
  watch(state, 'requestState', () => renderRequestState(state.requestState, submitBtn, spinnerEl));
  watch(state, 'modalState', () => renderModalState(state.modalState));
};
