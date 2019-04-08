export default (xmlData) => {
  const xmlDocument = new DOMParser().parseFromString(xmlData, 'application/xml');
  const getChannelDomain = channelURL => new URL(channelURL).hostname;
  const getChannelId = channelURL => getChannelDomain(channelURL).split('.').join('');
  const channelLink = xmlDocument.querySelector('link').textContent;

  return {
    channel: {
      id: getChannelId(channelLink),
      domain: getChannelDomain(channelLink),
    },
    news: [...xmlDocument.querySelectorAll('item')]
      .map(item => ({
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        description: item.querySelector('description').textContent,
        pubDate: item.querySelector('pubDate').textContent,
        channelId: getChannelId(channelLink),
      })),
  };
};
