// cat addition to website
// credit: https://github.com/adryd325/oneko.js
// custom features like bed return and tracking the scroll position by henry
// original code: https://github.com/adryd325/oneko.js

function spawnOneko(initialX, initialY) {
  const nekoEl = document.createElement("div");
  let nekoPosX = initialX;
  let nekoPosY = initialY;
  let mousePosX = initialX;
  let mousePosY = initialY;

  const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
  if (isReduced) {
    return;
  }

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  const nekoSpeed = 10;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  let isReturningToBed = false;
  let bedTarget = null;

  function returnToBed(bedElement) {
    isReturningToBed = true;
    const rect = bedElement.getBoundingClientRect();
    // Target slightly above the bed to match original position
    bedTarget = {
      x: rect.left + 16,
      y: rect.top + 11
    };
    // Remove the mousemove listener so cursor is completely ignored
    document.removeEventListener("mousemove", handleMouseMove);
  }

  // Separate the mousemove handler so we can remove it
  function handleMouseMove(event) {
    mousePosX = event.pageX;
    mousePosY = event.pageY;
  }

  function create() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isMouseDevice = !isTouchDevice && !hasCoarsePointer;

    nekoEl.id = "oneko";
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "absolute";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.backgroundImage = "url('./oneko.gif')";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = Number.MAX_VALUE;

    document.body.appendChild(nekoEl);

    // Update to use named function for event listener
    document.addEventListener("mousemove", handleMouseMove);

    window.onekoInterval = setInterval(frame, 100);

    let lastScrollX = window.scrollX;
    let lastScrollY = window.scrollY;

    if (isMouseDevice) {
      window.addEventListener("scroll", function() {
        const deltaScrollX = window.scrollX - lastScrollX;
        const deltaScrollY = window.scrollY - lastScrollY;
        
        mousePosX += deltaScrollX;
        mousePosY += deltaScrollY;
        
        lastScrollX = window.scrollX;
        lastScrollY = window.scrollY;
        
        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
      });
    }
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (nekoPosX < 32) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < 32) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > document.documentElement.scrollHeight - 32) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    if (isReturningToBed) {
      // When returning to bed, always move towards bed target
      const diffX = nekoPosX - bedTarget.x;
      const diffY = nekoPosY - bedTarget.y;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

      if (distance < nekoSpeed) {
        // Remove the moving cat
        document.body.removeChild(nekoEl);
        
        // Recreate the sleeping cat
        const sleepingOneko = document.createElement('div');
        sleepingOneko.id = 'sleepingOneko';
        sleepingOneko.style = 'position: absolute; top: -5px; left: 0; width: 32px; height: 32px; background-image: url(\'./oneko.gif\'); image-rendering: pixelated;';
        sleepingOneko.title = 'click me :)';
        
        sleepingOneko.addEventListener('click', function() {
          const rect = this.parentElement.getBoundingClientRect();
          spawnOneko(rect.left + 16, rect.top + 16);
          this.remove();
        });
        
        const container = document.querySelector('.oneko-container');
        container.appendChild(sleepingOneko);
        
        clearInterval(window.onekoInterval);
        return;
      }

      // Use the same animation logic as cursor following
      frameCount += 1;
      idleAnimation = null;
      idleAnimationFrame = 0;
      idleTime = 0;

      let direction = '';
      direction += diffY / distance > 0.5 ? "N" : "";
      direction += diffY / distance < -0.5 ? "S" : "";
      direction += diffX / distance > 0.5 ? "W" : "";
      direction += diffX / distance < -0.5 ? "E" : "";
      setSprite(direction, frameCount);

      nekoPosX -= (diffX / distance) * nekoSpeed;
      nekoPosY -= (diffY / distance) * nekoSpeed;

      nekoEl.style.left = `${nekoPosX - 16}px`;
      nekoEl.style.top = `${nekoPosY - 16}px`;
      return;
    }

    // Original frame logic for cursor following
    frameCount += 1;
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), document.documentElement.scrollHeight - 16);
    
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    
  }

  // Make returnToBed available globally
  window.returnToBed = returnToBed;

  create();

}