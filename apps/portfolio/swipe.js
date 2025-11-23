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

// ★ 共通：1枚のカードを飛ばして、束の一番後ろに回す関数
function dismissCard(card, evLike) {
  var moveOutWidth = document.body.clientWidth;

  // 軽めスワイプでも飛びやすいしきい値
  var distanceThreshold = 40;
  var velocityThreshold = 0.15;

  // 「これくらいしか動いてない & 遅い」なら残す
  var keep =
    Math.abs(evLike.deltaX) < distanceThreshold &&
    Math.abs(evLike.velocityX) < velocityThreshold;

  if (keep) {
    card.style.transform = '';
    card.classList.remove('removed');
    return;
  }

  card.classList.add('removed');

  var endX = Math.max(
    Math.abs(evLike.velocityX) * moveOutWidth,
    moveOutWidth
  );
  var toX = evLike.deltaX > 0 ? endX : -endX;
  var endY = Math.abs(evLike.velocityY) * moveOutWidth;
  var toY = evLike.deltaY > 0 ? endY : -endY;
  var xMulti = evLike.deltaX * 0.03;
  var yMulti = evLike.deltaY / 80;
  var rotate = xMulti * yMulti;

  card.style.transform =
    'translate(' +
    toX +
    'px, ' +
    (toY + evLike.deltaY) +
    'px) rotate(' +
    rotate +
    'deg)';

  setTimeout(function () {
    card.classList.remove('removed');
    card.style.transform = '';
    card.style.transition = 'none';

    // 束の一番後ろへ移動（ループさせる）
    card.parentNode.appendChild(card);

    // 新しい順番でカードの重なりを再計算
    initCards();

    // 次のアニメ用に transition を戻す
    requestAnimationFrame(function () {
      card.style.transition = '';
    });
  }, 300);
}

// 1枚のカードにスワイプ＆タップ挙動を付与
function addCardListeners(card) {
  var hammertime = new Hammer(card);

  // スワイプ中
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

  // スワイプ終了
  hammertime.on('panend', function (event) {
    card.classList.remove('moving');
    tinderContainer.classList.remove('tinder_love');
    tinderContainer.classList.remove('tinder_nope');

    dismissCard(card, {
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      velocityX: event.velocityX,
      velocityY: event.velocityY
    });
  });

  // ★ タップで次のカードへ（右スワイプ扱い）
  hammertime.on('tap', function () {
    dismissCard(card, {
      deltaX: 100,
      deltaY: 0,
      velocityX: 0.3,
      velocityY: 0
    });
  });
}

// すべてのカードにイベント付与
allCards.forEach(function (card) {
  addCardListeners(card);
});
initCards();

// ボタン用（CSSで display:none でも生きてる）
function createButtonListener(loveDirection) {
  return function (event) {
    var cards = document.querySelectorAll('.tinder--card');
    if (!cards.length) return;

    var card = cards[0];

    dismissCard(card, {
      deltaX: loveDirection ? 100 : -100,
      deltaY: 0,
      velocityX: 0.3,
      velocityY: 0
    });

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

