import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateRoomFromPhotoAspect} from '../lib/design/photoRoomEstimate';
import {hasUserRoomDimensions} from '../lib/design/roomMeta';

test('photo proportions do not become confirmed room measurements',()=>{
  for(const [width,height] of [[1,1],[1920,1080],[800,1600]]){
    const preview=estimateRoomFromPhotoAspect(width,height,'l-shape','kitchen',null);
    assert.equal(preview.userConfirmed,false);
    assert.equal(preview.scanConfidence,'low');
    assert.equal(hasUserRoomDimensions(preview),false);
    assert.ok(preview.widthIn>=48&&preview.widthIn<=480);
    assert.ok(preview.depthIn>=48&&preview.depthIn<=480);
  }
});
