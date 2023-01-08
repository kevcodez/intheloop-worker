import { Translate } from '@google-cloud/translate/build/src/v2';
import { Inject, Injectable } from '@nestjs/common';
import { decode } from 'html-entities';

@Injectable()
export class LanguageDetector {
  constructor(@Inject('translate') private translate: Translate) {}

  async detectLanguage(text: string): Promise<null | string> {
    if (!text) {
      return null;
    }
    const strippedText = text.replace(/(<([^>]+)>)/gi, '');
    const htmlEntitiesDecoded = decode(strippedText);

    // Google Cloud bills based on the amount of characters
    const maxCharacterCount = 50;
    const partOfTheText =
      htmlEntitiesDecoded.length > maxCharacterCount
        ? htmlEntitiesDecoded.slice(0, maxCharacterCount)
        : htmlEntitiesDecoded;

    const detections = await this.translate.detect(partOfTheText);
    const detectionsArray = Array.isArray(detections) ? detections : [detections];
    if (detectionsArray.length) {
      return detectionsArray[0].language;
    } else {
      return null;
    }
  }
}
