document.addEventListener('DOMContentLoaded', async () => {
    const topVideos = document.getElementById('topVideos');
    const searchResults = document.getElementById('searchResults');
    const monochrome = document.getElementById('monochrome');
    const status = document.getElementById('status');
  
    // 現在の設定をロード
    chrome.storage.sync.get(
      ['MAX_TOP_VIDEOS', 'MAX_SEARCH_RESULTS', 'ENABLE_MONOCHROME'],
      (data) => {
        topVideos.value = data.MAX_TOP_VIDEOS ?? 1;
        searchResults.value = data.MAX_SEARCH_RESULTS ?? 10;
        monochrome.checked = data.ENABLE_MONOCHROME ?? true;
      }
    );
  
    // 保存ボタン
    document.getElementById('save').addEventListener('click', () => {
      chrome.storage.sync.set(
        {
          MAX_TOP_VIDEOS: Number(topVideos.value),
          MAX_SEARCH_RESULTS: Number(searchResults.value),
          ENABLE_MONOCHROME: monochrome.checked,
        },
        () => {
          status.textContent = '✅ Saved!';
          setTimeout(() => (status.textContent = ''), 1500);
        }
      );
    });
  });
  