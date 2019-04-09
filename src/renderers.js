import $ from 'jquery';
import _ from 'lodash';

const generateMarkupForNewsItem = (item) => {
  const description = item.description.length > 0 ? item.description : 'Description is missing';
  return `<li class="list-group-item">
    <button type="button" class="btn btn-light ml-3 float-right" data-toggle="modal" data-target="#modalWindow">Description</button>
    <a href="${item.link}" target="_blank" class="article-link block-text mb-3 text-decoration-none">${item.title}</a>
    <div class="item-description d-none">${description}</div>
  </li>`;
};

const renderNews = (items, tabState, wrapper) => {
  const groupedItems = _.groupBy(items, item => item.channelId);
  const wrapperMarkup = Object.keys(groupedItems).map((channelId) => {
    const itemsMarkup = groupedItems[channelId].map(generateMarkupForNewsItem);
    return `<div class="tab-pane fade" id="v-pills-${channelId}" role="tabpanel">
      <ul class="list-group">${itemsMarkup.join('')}</ul>
    </div>`;
  });

  wrapper.innerHTML = wrapperMarkup.join('');
  $(`#v-pills-${tabState.prevTab}`).removeClass('active');
  $(`#v-pills-${tabState.prevTab}`).removeClass('show');
  $(`#v-pills-${tabState.currTab}`).addClass('active');
  $(`#v-pills-${tabState.currTab}`).addClass('show');
};

const renderChannels = (channels, wrapper, inputField) => {
  const channelsMarkup = channels.map(({ id, domain }) => `<a class="nav-link bg-light text-dark mb-1" id="v-pills-${id}-tab" data-toggle="pill" href="#v-pills-${id}" role="tab"
      aria-selected="false">${domain}</a>`);

  wrapper.innerHTML = channelsMarkup.join('');
  inputField.value = '';
  inputField.classList.remove('is-valid');
};

const renderForm = (urlState, inputField, submitBtn) => {
  inputField.removeAttribute('class');
  inputField.classList.add('form-control');

  const stateRenderersDispatcher = {
    valid: () => {
      inputField.classList.add('is-valid');
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-danger');
    },
    invalid: () => {
      inputField.classList.add('is-invalid');
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-danger');
    },
  };

  stateRenderersDispatcher[urlState]();
};

const renderRequestState = (requestState, submitBtn, spinner) => {
  const stateRenderersDispatcher = {
    isProcessing: () => {
      spinner.classList.remove('d-none');
      submitBtn.disabled = true;
    },
    failed: () => {
      spinner.classList.add('d-none');
      submitBtn.disabled = false;
      document.querySelector('#alertBox').innerHTML = `<div class="alert alert-danger mb-0" role="alert">
          Something went wrong :( Please, try again later.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>`;
    },
    succeed: () => {
      spinner.classList.add('d-none');
      submitBtn.disabled = false;
      document.querySelector('#alertBox').innerHTML = `<div class="alert alert-success mb-0" role="alert">
          Yay! A new feed has been added!
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>`;
    },
  };

  stateRenderersDispatcher[requestState]();
};

const renderModalState = ({ title, description }) => {
  document.querySelector('.modal-title').textContent = title;
  document.querySelector('.modal-body p').innerHTML = description;
};

export {
  renderChannels, renderNews, renderForm, renderRequestState, renderModalState,
};
