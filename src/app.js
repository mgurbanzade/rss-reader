import '../favicon.ico';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import axios from 'axios';
import validator from 'validator';
import { watch } from 'melanke-watchjs';
import parseRSSFeed from './rssParser';
import {
  renderChannels, renderNews, renderForm, renderRequestState, renderModalState,
} from './renderers';

const CORSproxy = 'https://cors-anywhere.herokuapp.com';
const defaultUpdateTimeMs = 5000;

export default () => {
  const state = {
    channels: [],
    news: [],
    feedLinks: [],
    urlState: null,
    requestState: null,
    tabState: {
      prevTab: null,
      currTab: null,
    },
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

  submitBtn.addEventListener('click', () => {
    const inputValue = inputField.value;
    const requestLink = `${CORSproxy}/${inputValue}`;
    if (inputValue.length === 0) return;

    state.requestState = 'isProcessing';
    axios.get(requestLink).then((response) => {
      const parsedData = parseRSSFeed(response.data);
      state.channels = [
        ...state.channels, parsedData.channel,
      ];
      state.tabState.prevTab = state.tabState.currTab;
      state.tabState.currTab = parsedData.channel.id;
      state.news = state.news.concat(parsedData.news);
      state.feedLinks = [...state.feedLinks, inputValue];
      state.requestState = 'succeed';
    }).catch(() => {
      state.requestState = 'failed';
    });
  });

  inputField.addEventListener('input', (e) => {
    const isValidURL = validator.isURL(e.target.value);
    const isNotDuplicateURL = !state.feedLinks.includes(e.target.value);
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
      const promises = state.feedLinks.map(link => axios.get(`${CORSproxy}/${link}`));

      Promise.all(promises).then((responses) => {
        const parsedResponses = responses.map(({ data }) => parseRSSFeed(data).news);
        const latestItems = parsedResponses.map((newsItems) => {
          const sortByDate = (a, b) => Math.sign(a.pubDate < b.pubDate);
          const currLatestUpdateTime = state.news
            .filter(newsItem => newsItem.channelId === newsItems[0].channelId)
            .sort(sortByDate)[0].pubDate;
          return newsItems.filter(item => item.pubDate > currLatestUpdateTime);
        }).flat();

        state.news = latestItems.concat(state.news);
      }).finally(lookForUpdates);
    }, interval);
  };

  $(document).on('click', '[data-toggle="pill"]', (e) => {
    state.tabState.prevTab = state.tabState.currTab;
    state.tabState.currTab = $(e.target).attr('href').split('#v-pills-')[1];
  });

  lookForUpdates();

  watch(state, 'channels', () => renderChannels(state.channels, tabsContainer, inputField));
  watch(state, 'news', () => renderNews(state.news, state.tabState, tabItemsContainer));
  watch(state, 'urlState', () => renderForm(state.urlState, inputField, submitBtn));
  watch(state, 'requestState', () => renderRequestState(state.requestState, submitBtn, spinnerEl));
  watch(state, 'modalState', () => renderModalState(state.modalState));
};
