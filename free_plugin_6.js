(function () {
    'use strict';

    function createFreePlugin() {
        const sources = [
            {
                name: 'UAKino',
                url: 'https://uakino.me/rss.xml',  // RSS-стрічка
                parser: function (query) {
                    return this.url;  // Повертає URL RSS-стрічки
                }
            }
        ];

        Lampa.Component.add('free_plugin', function () {
            this.create = function () {
                this.activity.loader(true);
                const query = this.activity.query;
                const searchResults = [];
                let completedRequests = 0;

                sources.forEach(source => {
                    const url = source.parser(query);
                    Lampa.Network.request(url, {}, (response) => {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(response, 'application/xml');
                        const items = xmlDoc.querySelectorAll('item');

                        items.forEach(item => {
                            const title = item.querySelector('title')?.textContent.trim();
                            const link = item.querySelector('link')?.textContent.trim();

                            if (title && link) {
                                searchResults.push({
                                    source: source.name,
                                    title,
                                    link
                                });
                            }
                        });

                        completedRequests++;
                        if (completedRequests === sources.length) {
                            this.showResults(searchResults);
                        }
                    }, () => {
                        completedRequests++;
                        if (completedRequests === sources.length) {
                            this.showResults(searchResults);
                        }
                    });
                });
            };

            this.showResults = function (results) {
                this.activity.loader(false);
                if (results.length === 0) {
                    Lampa.Noty.show('Результати не знайдені.');
                    return;
                }

                results.forEach(result => {
                    const item = Lampa.Template.get('button', {
                        title: `${result.source}: ${result.title}`,
                        description: result.link
                    });

                    item.on('hover:enter', () => {
                        Lampa.Platform.openURL(result.link);
                    });

                    this.append(item);
                });
            };
        });
    }

    createFreePlugin();
})();
