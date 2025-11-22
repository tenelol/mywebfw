'use strict';

// コンテナとカードたち
var tinderContainer = document.querySelector('.tinder');
var allCards = Array.prototype.slice.call(
  document.querySelectorAll('.tinder--card')
);

// ボタン（DOMには置いてあるが、CSSで非表示にしてOK）
var nope = document.getElementById('nope');
var love = document.getElementById('love');

// カードの重なり・スケールを再計算
function initCards() {
  var newCards = document.querySelectorAll('.tinder--card');

  newCards.forEach(function (card, index) {
    card.style.zIndex = newCards.length - index;
    card.style.transform =
      'scale(' +
      (20 - index) / 20 +
      ') translateY(-' +
      30 * index +
      'px)';
    card.style.opacity = (10 - index) / 10;
  });
}

// 1枚のカードにスワイプ挙動を付与
function addCardListeners(card) {
  var hammertime = new Hammer(card);

  hammertime.on('pan', function (event) {
    card.classList.add('moving');

    var xMulti = event.deltaX * 0.03;
    var yMulti = event.deltaY / 80;
    var rotate = xMulti * yMulti;

    card.style.transform =
      'translate(' +
      event.deltaX +
      'px, ' +
      event.deltaY +
      'px) rotate(' +
      rotate +
      'deg)';

    if (event.deltaX > 0) {
      tinderContainer.classList.add('tinder_love');
      tinderContainer.classList.remove('tinder_nope');
    } else if (event.deltaX < 0) {
      tinderContainer.classList.add('tinder_nope');
      tinderContainer.classList.remove('tinder_love');
    }
  });

  hammertime.on('panend', function (event) {
    card.classList.remove('moving');
    tinderContainer.classList.remove('tinder_love');
    tinderContainer.classList.remove('tinder_nope');

    var moveOutWidth = document.body.clientWidth;

    // ★ 軽めスワイプでも飛びやすいしきい値
    var distanceThreshold = 40;
    var velocityThreshold = 0.15;

    // 「これくらいしか動いてない & 遅い」なら残す
    var keep =
      Math.abs(event.deltaX) < distanceThreshold &&
      Math.abs(event.velocityX) < velocityThreshold;

    if (keep) {
      // 残す：元の位置に戻す
      card.style.transform = '';
      card.classList.remove('removed');
      return;
    }

    // 捨てる：画面外に飛ばす
    card.classList.add('removed');

    var endX = Math.max(
      Math.abs(event.velocityX) * moveOutWidth,
      moveOutWidth
    );
    var toX = event.deltaX > 0 ? endX : -endX;
    var endY = Math.abs(event.velocityY) * moveOutWidth;
    var toY = event.deltaY > 0 ? endY : -endY;
    var xMulti = event.deltaX * 0.03;
    var yMulti = event.deltaY / 80;
    var rotate = xMulti * yMulti;

    card.style.transform =
      'translate(' +
      toX +
      'px, ' +
      (toY + event.deltaY) +
      'px) rotate(' +
      rotate +
      'deg)';

    // ★ アニメーション後に末尾へ回してループさせる
    setTimeout(function () {
      card.classList.remove('removed');
      card.style.transform = '';
      card.style.transition = 'none';

      // 束の一番後ろへ移動
      card.parentNode.appendChild(card);

      // 新しい順番でカードの重なりを再計算
      initCards();

      // transition を戻す（次のスワイプ用）
      // ブラウザによっては setTimeout で1フレーム遅延させたほうがいいが、
      // ここでは簡単に requestAnimationFrame を使う
      requestAnimationFrame(function () {
        card.style.transition = '';
      });
    }, 300); // .tinder--card の transform アニメ時間と合わせる
  });
}

// すべてのカードにイベント付与
allCards.forEach(function (card) {
  addCardListeners(card);
});
initCards();

// ボタン用（CSSで display:none していてもOK）
function createButtonListener(love) {
  return function (event) {
    var cards = document.querySelectorAll('.tinder--card');
    if (!cards.length) return;

    var card = cards[0];

    // 疑似的に panend と同じ挙動をさせる
    var fakeEvent = {
      deltaX: love ? 100 : -100,
      deltaY: 0,
      velocityX: 0.3,
      velocityY: 0
    };

    // 手抜き：Hammer ではなく、上の panend ロジックとほぼ同じ処理を使う
    var moveOutWidth = document.body.clientWidth;
    var distanceThreshold = 40;
    var velocityThreshold = 0.15;

    var keep =
      Math.abs(fakeEvent.deltaX) < distanceThreshold &&
      Math.abs(fakeEvent.velocityX) < velocityThreshold;

    if (keep) return;

    card.classList.add('removed');

    var endX = Math.max(
      Math.abs(fakeEvent.velocityX) * moveOutWidth,
      moveOutWidth
    );
    var toX = love ? endX : -endX;
    var endY = Math.abs(fakeEvent.velocityY) * moveOutWidth;
    var toY = fakeEvent.deltaY > 0 ? endY : -endY;
    var xMulti = fakeEvent.deltaX * 0.03;
    var yMulti = fakeEvent.deltaY / 80;
    var rotate = xMulti * yMulti;

    card.style.transform =
      'translate(' +
      toX +
      'px, ' +
      (toY + fakeEvent.deltaY) +
      'px) rotate(' +
      rotate +
      'deg)';

    setTimeout(function () {
      card.classList.remove('removed');
      card.style.transform = '';
      card.style.transition = 'none';
      card.parentNode.appendChild(card);
      initCards();
      requestAnimationFrame(function () {
        card.style.transition = '';
      });
    }, 300);

    event && event.preventDefault();
  };
}

if (nope) {
  var nopeListener = createButtonListener(false);
  nope.addEventListener('click', nopeListener);
}

if (love) {
  var loveListener = createButtonListener(true);
  love.addEventListener('click', loveListener);
}

