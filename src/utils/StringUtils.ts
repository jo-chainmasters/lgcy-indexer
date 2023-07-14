export class StringUtils {
  public static isAddress(input: string) {
    if (!input) {
      return false;
    }

    if (input.startsWith('L') && input.length === 34) {
      return true;
    } else {
      return false;
    }
  }

  public static isTxHash(input: string) {
    if (!input) {
      return false;
    }

    if (input.length === 64) {
      return true;
    }
  }
}
