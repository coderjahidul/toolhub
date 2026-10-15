export type PasswordFormat = "random" | "passphrase" | "pin" | "alphanumeric";

const sets = {
  lower: "abcdefghijkmnopqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  numbers: "23456789",
  digits: "0123456789",
  symbols: "!@#$%^&*-_=+",
};

const words = `able acid acre actor adept adult agent alarm album alert alien alley amber amend ample angel apple apron arbor argue armor array arrow artist aspen atlas attic audio audit autumn avenue avocado bakery ballot bamboo banana banjo barley barrel basil basket beacon beagle berry birch bison black blade blanket bloom blossom board bonus bottle branch brass bread breeze brick bridge bright bronze brook broom brush bucket butter cabin cactus camel canal candle candy canoe canvas canyon cargo carpet carrot castle cattle cedar cellar cereal chair chalk chance charm chart cheese cherry chest chili cider circle citrus civic clam class cliff clock cloth cloud clover coach coast cocoa coffee comet coral cotton couple course cousin cover crane crate cream creek cricket crown crumb crust daisy dance delta depot diner donut draft dragon drawer dream drift drum dune eagle earth elbow elder ember empire entry falcon farmer feather fence ferry field figure flame flash flavor flint flower flute forest fossil frame frost fruit galaxy garden garlic gentle ginger glacier globe glove golden goose grain grape gravel green grove guitar hammer harbor harvest hazel health helmet honey horse house hunter icebox idea index inlet insect island ivory jacket jaguar jelly jewel jigsaw jumbo jungle kettle kitten koala ladle lantern laptop lemon letter lilac linen lizard lobster locker lodge lotus lucky lumber lunar magnet maiden mango mantle maple marble market meadow melon meteor middle mighty mineral mirror mobile modern moment monkey moon moss motor mountain mouse muffin music mustard napkin nectar needle night north novel number nurse ocean olive onion opera orbit orchard otter oven oyster paddle panda paper parcel parrot party pasta patch peach peanut pebble pencil pepper piano picnic pillow pilot pine pink pioneer pixel pizza planet plank plant plaza pocket poet polar pony porch portal potato prairie press prism prize pudding pumpkin puppy puzzle quail quartz quiet rabbit radar radio raisin ranch rapid raven razor ready realm recipe record reef relay river robin rocket rooster royal ruby rugby saddle sailor salad salmon sandal sandy satin sauce scale scarlet school scooter scout shadow shark sheep shell shelter shield shore shrimp silver simple sister skate sketch skyline slate sleep slice slope smile smoke snack snow soda solar solid song sound south space spark spear spice spider splash spring square stable stack stage stamp star steam steel stone store storm story stove straw stream street string studio sugar summer sunlit sunset supper surge table talent tango temple tennis tent thistle thyme tiger timber toast tomato torch tower track trail train travel tray treat tree trend tribe trout truck tulip tumble tunnel turtle twilight uncle union valley vanilla velvet vendor vessel violet violin visitor wagon walnut water weave wheat wheel whisper white willow window winter wisdom wolf wonder wool world yacht yard yellow yoga zebra zenith`.split(" ");

const wordList = [...new Set(words)];

export function randomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let value = 0;

  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return value % max;
}

function pick(source: string): string {
  return source[randomIndex(source.length)];
}

export function randomPassword(length: number, options: { lower: boolean; upper: boolean; numbers: boolean; symbols: boolean }): string {
  const groups = [
    options.lower ? sets.lower : "",
    options.upper ? sets.upper : "",
    options.numbers ? sets.numbers : "",
    options.symbols ? sets.symbols : "",
  ].filter(Boolean);

  if (groups.length === 0) {
    throw new Error("Choose at least one character set.");
  }

  const alphabet = groups.join("");
  const chars: string[] = [];

  if (groups.length <= length) {
    groups.forEach((group) => {
      chars.push(pick(group));
    });
  }

  while (chars.length < length) {
    chars.push(pick(alphabet));
  }

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1);
    [chars[index], chars[swap]] = [chars[swap], chars[index]];
  }

  return chars.join("");
}

export function passphrase(count: number, separator: string, capitalize: boolean): string {
  const chosen: string[] = [];
  const pool = [...wordList];

  for (let index = 0; index < count; index += 1) {
    const pickAt = randomIndex(pool.length);
    let word = pool.splice(pickAt, 1)[0];
    if (capitalize) {
      word = word[0].toUpperCase() + word.slice(1);
    }
    chosen.push(word);
    if (pool.length === 0) {
      pool.push(...wordList);
    }
  }

  return chosen.join(separator);
}

export function pin(length: number): string {
  return Array.from({ length }, () => pick(sets.digits)).join("");
}

export function alphanumericPassword(length: number): string {
  return randomPassword(length, { lower: true, upper: true, numbers: true, symbols: false });
}

export function entropyBits(format: PasswordFormat, length: number, alphabetSize: number, wordCount: number): number {
  if (format === "pin") {
    return Math.round(length * Math.log2(10));
  }
  if (format === "passphrase") {
    return Math.round(wordCount * Math.log2(wordList.length));
  }
  if (alphabetSize === 0) {
    return 0;
  }
  return Math.round(length * Math.log2(alphabetSize));
}

export function alphabetSize(options: { lower: boolean; upper: boolean; numbers: boolean; symbols: boolean }): number {
  return (
    (options.lower ? sets.lower.length : 0) +
    (options.upper ? sets.upper.length : 0) +
    (options.numbers ? sets.numbers.length : 0) +
    (options.symbols ? sets.symbols.length : 0)
  );
}

export const alphanumericAlphabetSize = sets.lower.length + sets.upper.length + sets.numbers.length;
export const wordListSize = wordList.length;
