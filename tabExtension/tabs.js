function getTabs(callback) {

    chrome.tabs.query(
        { currentWindow: true },

        (tabs) => {

            const urls = tabs.map((tab) => {

                return {
                    title: tab.title,
                    url: tab.url
                };

            });

            callback(urls);

        }

    );

}
