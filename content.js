(function() {
    'use strict';

    chrome.storage.sync.get(

        // 設定値の読み込み
        ['MAX_TOP_VIDEOS', 'MAX_SEARCH_RESULTS', 'ENABLE_MONOCHROME'],
        (data) => {
        const MAX_TOP_VIDEOS = data.MAX_TOP_VIDEOS ?? 1;
        const MAX_SEARCH_RESULTS = data.MAX_SEARCH_RESULTS ?? 10;
        const ENABLE_MONOCHROME = data.ENABLE_MONOCHROME ?? true;
        const DEBUG = true;
    
        /** ----------------------------------
         *  ✅ 実行条件: YouTube ドメインのみ
         * ---------------------------------- */
        if (!location.hostname.includes('youtube.com')) {
        if (DEBUG) console.log('[AnnoyMyselfYouTube] このサイトでは実行されません');
        return;
        }
    
        /** ----------------------------------
         *  1️⃣ 関連動画（右サイドバー）削除
         * ---------------------------------- */
        function removeRelated() {
        const el = document.querySelector('ytd-watch-next-secondary-results-renderer');
        if (el) {
            el.remove();
            if (DEBUG) console.log('[AnnoyMyselfYouTube] 関連動画を削除しました');
        }
        }
    
        /** ----------------------------------
         *  2️⃣ トップページの動画を n 件だけ残す
         * ---------------------------------- */
        function limitTopVideos(n = MAX_TOP_VIDEOS) {
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
            if (DEBUG) console.log(`[AnnoyMyselfYouTube] トップページの動画を${n}件だけ残しました`);
            }
        }
        }
    
        /** ----------------------------------
         *  3️⃣ 検索結果の動画を n 件だけ残す
         * ---------------------------------- */
        function limitSearchResults(n = MAX_SEARCH_RESULTS) {
            if (location.pathname !== '/results') return;
        
            // ✅ 検索結果のコンテナを特定
            let container = document.querySelector('ytd-item-section-renderer #contents');
        
            // フォールバック（念のため複数候補から絞り込み）
            if (!container) {
            const candidates = Array.from(document.querySelectorAll('#contents'));
            container = candidates.find(node =>
                node.closest('ytd-item-section-renderer') &&
                node.querySelector('ytd-video-renderer, ytd-channel-renderer, ytd-playlist-renderer')
            );
            }
        
            if (!container) return;
        
            // 直下の子要素を列挙
            const children = Array.from(container.children).filter(
            el => el && el.nodeType === Node.ELEMENT_NODE
            );
        
            // 指定数を超えたら削除
            if (children.length > n) {
            for (let i = n; i < children.length; i++) {
                // 続き読み込みボタンは残す
                if (children[i].tagName === 'YTD-CONTINUATION-ITEM-RENDERER') continue;
                children[i].remove();
            }
            if (DEBUG) console.log(`[AnnoyMyselfYouTube] 検索結果を${n}件だけ残しました`);
            }

            function disableInfiniteScroll() {
                const triggers = document.querySelectorAll('ytd-continuation-item-renderer');
                triggers.forEach(t => t.remove());
                if (DEBUG) console.log('[AnnoyMyselfYouTube] 無限スクロールを停止しました');
            }

            disableInfiniteScroll();
        }
    
    
        /** ----------------------------------
         *  4️⃣ 画面を白黒化
         * ---------------------------------- */
        function makePageMonochrome() {
        if (!ENABLE_MONOCHROME) return;
        const style = document.createElement('style');
        style.textContent = `
            html {
            filter: grayscale(100%) !important;
            -webkit-filter: grayscale(100%) !important;
            }
        `;
        document.head.appendChild(style);
        if (DEBUG) console.log('[AnnoyMyselfYouTube] 画面を白黒にしました');
        }
    
        /** ----------------------------------
         *  5️⃣ エンドスクリーンを削除
         * ---------------------------------- */
        function removeEndscreen() {
        const nodes = document.querySelectorAll('.ytp-endscreen-content');
        if (nodes.length) {
            nodes.forEach(n => n.remove());
            if (DEBUG) console.log(`[AnnoyMyselfYouTube] エンドスクリーンを削除しました x${nodes.length}`);
        }
        }
    
        // CSSで強制的に非表示
        const styleEndscreen = document.createElement('style');
        styleEndscreen.textContent = `.ytp-endscreen-content { display: none !important; }`;
        document.head.appendChild(styleEndscreen);
    
        /** ----------------------------------
         *  6️⃣ DOM変化・イベント監視（SPA対応）
         * ---------------------------------- */
        const observer = new MutationObserver(() => {
        removeRelated();
        limitTopVideos(MAX_TOP_VIDEOS);
        limitSearchResults(MAX_SEARCH_RESULTS);
        removeEndscreen();
        });
    
        observer.observe(document.documentElement, { childList: true, subtree: true });
    
        window.addEventListener('yt-navigate-finish', () => {
        removeRelated();
        limitTopVideos(MAX_TOP_VIDEOS);
        limitSearchResults(MAX_SEARCH_RESULTS);
        removeEndscreen();
        }, true);
    
        document.addEventListener('ended', removeEndscreen, true);
    
        /** ----------------------------------
         *  7️⃣ 初回実行
         * ---------------------------------- */
        makePageMonochrome();
        removeRelated();
        limitTopVideos(MAX_TOP_VIDEOS);
        limitSearchResults(MAX_SEARCH_RESULTS);
        removeEndscreen();
    })
})();
