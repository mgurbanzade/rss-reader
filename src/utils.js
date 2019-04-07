const parseRSSFeed = (xmlData) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlData, 'application/xml');
};

const getChannelDomain = (channelURL) => {
  const url = new URL(channelURL);
  return channelURL.includes('www') ? url.hostname.split('www.')[1] : url.hostname;
};
const getChannelId = channelURL => getChannelDomain(channelURL).split('.').join('');

const generateChannelObject = ({ data }) => {
  const xmlDocument = parseRSSFeed(data);
  const link = xmlDocument.querySelector('link').textContent;
  return {
    id: getChannelId(link),
    domain: getChannelDomain(link),
  };
};

const generateNewsObject = ({ data }) => {
  const xmlDocument = parseRSSFeed(data);
  const channelLink = xmlDocument.querySelector('link').textContent;
  const childAttributes = ['title', 'link', 'description', 'pubDate'];
  return [...xmlDocument.querySelectorAll('item')]
    .map(item => [...item.children]
      .filter(child => childAttributes.includes(child.nodeName)))
    .map(child => ({
      title: child.filter(c => c.nodeName === 'title')[0].textContent,
      link: child.filter(c => c.nodeName === 'link')[0].textContent,
      description: child.filter(c => c.nodeName === 'description')[0].textContent,
      pubDate: child.filter(c => c.nodeName === 'pubDate')[0].textContent,
      channelId: getChannelId(channelLink),
    }));
};

const getHotNewsItems = responses => responses
  .map(response => generateNewsObject(response));

export {
  generateChannelObject, generateNewsObject, parseRSSFeed, getHotNewsItems,
};
