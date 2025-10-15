(function() {
    'use strict';
  
    /** ----------------------------------
     *  ✅ 実行条件: YouTube ドメインのみ
     * ---------------------------------- */
    if (!location.hostname.includes('youtube.com')) {
      console.log('[AnnoyMyselfYouTube] このサイトでは実行されません');
      return;
    }
  
    /** ----------------------------------
     *  1️⃣ 関連動画（右サイドバー）削除
     * ---------------------------------- */
    function removeRelated() {
      const el = document.querySelector('ytd-watch-next-secondary-results-renderer');
      if (el) {
        el.remove();
        console.log('[AnnoyMyselfYouTube] 関連動画を削除しました');
      }
    }
  
    /** ----------------------------------
     *  2️⃣ トップページの動画を n 件だけ残す
     * ---------------------------------- */
    function limitTopVideos(n = 1) {
      const result = document.evaluate(
        '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-browse/ytd-two-column-browse-results-renderer/div[1]/ytd-rich-grid-renderer/div[6]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const container = result.singleNodeValue;
  
      if (container) {
        const children = Array.from(container.children);
        if (children.length > n) {
          for (let i = n; i < children.length; i++) {
            children[i].remove();
          }
          console.log(`[AnnoyMyselfYouTube] トップページの動画を${n}件だけ残しました`);
        }
      }
    }
  
    /** ----------------------------------
     *  3️⃣ 画面を白黒化
     * ---------------------------------- */
    function makePageMonochrome() {
      const style = document.createElement('style');
      style.textContent = `
        html {
          filter: grayscale(100%) !important;
          -webkit-filter: grayscale(100%) !important;
        }
      `;
      document.head.appendChild(style);
      console.log('[AnnoyMyselfYouTube] 画面を白黒にしました');
    }
  
    /** ----------------------------------
     *  4️⃣ エンドスクリーンを削除
     * ---------------------------------- */
    function removeEndscreen() {
      const nodes = document.querySelectorAll('.ytp-endscreen-content');
      if (nodes.length) {
        nodes.forEach(n => n.remove());
        console.log(`[AnnoyMyselfYouTube] エンドスクリーンを削除しました x${nodes.length}`);
      }
    }
  
    // CSSで強制的に非表示
    const styleEndscreen = document.createElement('style');
    styleEndscreen.textContent = `.ytp-endscreen-content { display: none !important; }`;
    document.head.appendChild(styleEndscreen);
  
    /** ----------------------------------
     *  5️⃣ DOM変化・イベント監視（SPA対応）
     * ---------------------------------- */
    const observer = new MutationObserver(() => {
      removeRelated();
      limitTopVideos(1);
      removeEndscreen();
    });
  
    observer.observe(document.documentElement, { childList: true, subtree: true });
  
    window.addEventListener('yt-navigate-finish', () => {
      removeRelated();
      limitTopVideos(1);
      removeEndscreen();
    }, true);
  
    document.addEventListener('ended', removeEndscreen, true);
  
    /** ----------------------------------
     *  6️⃣ 初回実行
     * ---------------------------------- */
    makePageMonochrome();
    removeRelated();
    limitTopVideos(1);
    removeEndscreen();
  
  })();
  