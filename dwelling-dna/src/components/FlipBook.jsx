import { forwardRef, useRef, useImperativeHandle, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import CoverPage from './CoverPage';
import BackCover from './BackCover';
import TOCRight from './TOCRight';
import TOCLeft from './TOCLeft';
import ChapterSpread from './ChapterSpread';
import CultureLeft from './CultureLeft';
import CultureRight from './CultureRight';
import FusionLeft from './FusionLeft';
import FusionRight from './FusionRight';

// Page structure with direction="rtl" (odd index = RIGHT, even index = LEFT):
//  0: CoverPage
//  1: TOCRight        (odd → RIGHT)
//  2: TOCLeft         (even → LEFT)
//  3: ChapterSpread right/cultures  (odd → RIGHT)
//  4: ChapterSpread left/cultures   (even → LEFT)
//  5+i*2: CultureRight[i]           (odd → RIGHT, text)
//  6+i*2: CultureLeft[i]            (even → LEFT, images)
//  5+nC*2: ChapterSpread right/fusions
//  6+nC*2: ChapterSpread left/fusions
//  7+nC*2+i*2: FusionRight[i]
//  8+nC*2+i*2: FusionLeft[i]
//  7+nC*2+nF*2: BackCover

const FlipBook = forwardRef(function FlipBook(
  {
    cultures, contentMap, imagesMap, onPageChange, onContentChange, onImageChange,
    fusions, fusionContentMap, fusionImagesMap, onFusionContentChange, onFusionImageChange, onFusionDelete,
    onOpenCultureModal, onOpenFusionModal,
    startPage,
  },
  ref
) {
  const bookRef = useRef(null);
  const nCultures = cultures.length;

  useImperativeHandle(ref, () => ({
    flipNext: () => bookRef.current?.pageFlip()?.flipNext(),
    flipPrev: () => bookRef.current?.pageFlip()?.flipPrev(),
    flip: (n) => bookRef.current?.pageFlip()?.flip(n),
    getCurrentPage: () => bookRef.current?.pageFlip()?.getCurrentPageIndex() ?? 0,
  }));

  const handleFlip = useCallback((e) => {
    onPageChange?.(e.data);
  }, [onPageChange]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') bookRef.current?.pageFlip()?.flipNext();
      if (e.key === 'ArrowLeft')  bookRef.current?.pageFlip()?.flipPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleGoTo = useCallback((n) => {
    bookRef.current?.pageFlip()?.flip(n);
  }, []);

  const culturePages = cultures.flatMap((culture, i) => [
    <CultureRight
      key={`${culture.id}-right`}
      culture={culture}
      content={contentMap?.[culture.id]}
      onContentChange={(updates) => onContentChange?.(culture.id, updates)}
      pageNum={5 + i * 2}
    />,
    <CultureLeft
      key={`${culture.id}-left`}
      culture={culture}
      images={imagesMap?.[culture.id]}
      onImageChange={(spaceId, url) => onImageChange?.(culture.id, spaceId, url)}
      pageNum={6 + i * 2}
    />,
  ]);

  const fusionPages = (fusions || []).flatMap((fusion, i) => [
    <FusionRight
      key={`${fusion.id}-right`}
      fusion={fusion}
      content={fusionContentMap?.[fusion.id]}
      onContentChange={(updates) => onFusionContentChange?.(fusion.id, updates)}
      onDelete={onFusionDelete}
      pageNum={7 + nCultures * 2 + i * 2}
    />,
    <FusionLeft
      key={`${fusion.id}-left`}
      fusion={fusion}
      images={fusionImagesMap?.[fusion.id]}
      onImageChange={(spaceId, url) => onFusionImageChange?.(fusion.id, spaceId, url)}
      pageNum={8 + nCultures * 2 + i * 2}
    />,
  ]);

  return (
    <div className="flipbook-container">
      <HTMLFlipBook
        ref={bookRef}
        width={560}
        height={760}
        size="fixed"
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={false}
        onFlip={handleFlip}
        startPage={startPage ?? 0}
        flippingTime={700}
        useMouseEvents={true}
        swipeDistance={30}
        direction="rtl"
        className="flipbook"
      >
        <CoverPage key="cover" />
        <TOCRight
          key="toc-right"
          cultures={cultures}
          onGoTo={handleGoTo}
          onOpenCultureModal={onOpenCultureModal}
        />
        <TOCLeft
          key="toc-left"
          cultures={cultures}
          fusions={fusions || []}
          onGoTo={handleGoTo}
          onOpenFusionModal={onOpenFusionModal}
        />
        <ChapterSpread key="ch1-right" side="right" chapter="cultures" />
        <ChapterSpread key="ch1-left"  side="left"  chapter="cultures" />
        {culturePages}
        <ChapterSpread key="ch2-right" side="right" chapter="fusions" />
        <ChapterSpread key="ch2-left"  side="left"  chapter="fusions" />
        {fusionPages}
        <BackCover key="back" />
      </HTMLFlipBook>
    </div>
  );
});

export default FlipBook;
