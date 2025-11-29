'use client';

import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import '@/lib/env';

import Figure from '@/components/Figure';
import KatexSpan from '@/components/KaTeX';
import ImageCompare from '@/components/Compare';
import ArrowLink from '@/components/links/ArrowLink';
import UnderlineLink from '@/components/links/UnderlineLink';

type Author = {
  name: string;
  url?: string; // Optional website URL
  affiliation?: string; // Affiliation superscript (e.g., "1", "1,2")
};


export default function HomePage() {
  const textColor = 'text-gray-600';
  const bgColor = 'bg-white';
  const maskColor = 'bg-stone-300/70';
  const secondaryBgColor = 'bg-gray-100';
  const hlTextColor = "text-primary-600";
  const hl2TextColor = "text-red-700";
  const hlBgColor = "bg-primary-600";
  const linkIconClass = 'h-6 w-6 shrink-0';
  
  // Authors list - add your authors here
  const authors: Author[] = [
    { name: 'Haoyang He', url: 'https://purenothingness24.github.io', affiliation: '1,2' },
    { name: 'Jay Patrikar', url: 'https://www.jaypatrikar.me/', affiliation: '2' },
    { name: 'Dong-Ki Kim', url: 'https://dkkim93.github.io/', affiliation: '2' },
    { name: 'Max Smith', url: 'https://www.maxosmith.com/', affiliation: '2' },
    { name: 'Daniel McGann', url: 'https://danmcgann.com/', affiliation: '2' },
    { name: 'Ali Agha', url: 'https://www.fieldai.com/', affiliation: '2' },
    { name: 'Shayegan Omidshafiei', url: 'https://www.fieldai.com/', affiliation: '2' },
    { name: 'Sebastian Scherer', url: 'https://www.ri.cmu.edu/ri-faculty/sebastian-scherer/', affiliation: '1,2' },
  ];
  
  // Background configuration - set to null to use default gray background
  // For video: use '/video/your-video.mp4'
  // For image: use '/images/your-image.png'
  // const backgroundVideo = '/video/CoMe-Intro-v5.mp4'; // Set to null to disable
  const backgroundVideo = null;
  const backgroundImage = '/images/groundctrl_intro1s.gif'; 
  const backgroundOverlay = 'bg-black/40'; // Overlay color (adjust opacity: bg-black/20 to bg-black/80)
  const citation_bibtex = `@article{grndctrl2026,
      title={GrndCtrl: Grounding World Models via Self-Supervised Reward Alignment}, 
      author={[Authors to be added]},
      journal={CVPR},
      year={2026},
      url={https://arxiv.org/abs/[arxiv-id]}, 
}`;
  const sliderItems: { title: string; content: React.ReactNode }[] = [
    {
      title: 'Overview',
      content: (
        <div className='space-y-4 text-base leading-relaxed'>
          <p>
            <b>Reinforcement Learning with World Grounding (RLWG)</b> addresses geometric inconsistencies 
            in pretrained video world models through self-supervised post-training with verifiable rewards. 
            Instead of reconstruction losses, RLWG grounds models using geometric and perceptual rewards 
            from frozen evaluators.
          </p>
          <p>
            <b>GrndCtrl</b> instantiates RLWG using Group Relative Policy Optimization (GRPO), enabling 
            physically consistent rollouts essential for reliable world generation.
          </p>
        </div>
      ),
    },
    {
      title: 'Problem',
      content: (
        <div className='space-y-4 text-base leading-relaxed'>
          <p>
            Despite impressive generative fidelity, current video world models often capture the 
            <em> appearance</em> of motion more than its <em>structure</em>. Their rollouts remain 
            visually plausible but geometrically and temporally inconsistent: poses drift, depths wobble, 
            and trajectories lose alignment over time.
          </p>
          <p>
            These instabilities limit the use of current models for closed-loop tasks such as 
            localization, mapping, and planning, where physically consistent representation is essential.
          </p>
        </div>
      ),
    },
    {
      title: 'Solution',
      content: (
        <div className='space-y-4 text-base leading-relaxed'>
          <p>
            <b>RLWG</b> refines pretrained world models using verifiable geometric and perceptual 
            rewards derived from model rollouts. Each rollout is automatically scored using rewards 
            that quantify spatial and temporal coherence, such as pose cycle-consistency, depth 
            reprojection agreement, and action adherence.
          </p>
          <p>
            <b>GrndCtrl</b> uses GRPO to optimize these verifiable rewards efficiently, preserving 
            visual quality while progressively aligning the model's dynamics with measurable structure 
            in the real world.
          </p>
        </div>
      ),
    },
  ];
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const middleChild = slider.children[1] as HTMLElement | undefined;
    if (!middleChild) return;
    const sliderWidth = slider.clientWidth;
    const tileWidth = middleChild.clientWidth;
    const targetScroll = middleChild.offsetLeft - (sliderWidth - tileWidth) / 2;
    slider.scrollLeft = targetScroll;
  }, []);

  // Video sets for qualitative comparison
  type VideoSet = {
    folder: string;
    name: string;
    baseline: string;
    groundTruth: string;
    ours: string;
  };

  const videoSets: VideoSet[] = [
    {
      folder: 'vids-coda2',
      name: 'CODA 2',
      baseline: '/images/vids-coda2/16_22_baseline.gif',
      groundTruth: '/images/vids-coda2/16_22_gt.gif',
      ours: '/images/vids-coda2/16_22_ours.gif',
    },
    {
      folder: 'vids-scand2',
      name: 'Scand 2',
      baseline: '/images/vids-scand2/scand_sample_base.gif',
      groundTruth: '/images/vids-scand2/scand_sample_gt.gif',
      ours: '/images/vids-scand2/scand_sample_ours.gif',
    },
    {
      folder: 'vids-citywalk1',
      name: 'CityWalk 1',
      baseline: '/images/vids-citywalk1/citywalk_sample71_base.gif',
      groundTruth: '/images/vids-citywalk1/citywalk_sample71_gt.gif',
      ours: '/images/vids-citywalk1/citywalk_sample71_ours.gif',
    },
    {
      folder: 'vids-coda1',
      name: 'CODA 1',
      baseline: '/images/vids-coda1/13_10_baseline.gif',
      groundTruth: '/images/vids-coda1/13_10_gt.gif',
      ours: '/images/vids-coda1/13_10_ours.gif',
    },
    {
      folder: 'vids-scand1',
      name: 'Scand 1',
      baseline: '/images/vids-scand1/sample_11baseline.gif',
      groundTruth: '/images/vids-scand1/sample_11gt.gif',
      ours: '/images/vids-scand1/ours_sample11.gif',
    },
    {
      folder: 'vids-citywalk2',
      name: 'CityWalk 2',
      baseline: '/images/vids-citywalk2/citywalk_230base.gif',
      groundTruth: '/images/vids-citywalk2/citywalk_230gt.gif',
      ours: '/images/vids-citywalk2/citywalk_230ours.gif',
    }
  ];

  const [selectedVideoSet, setSelectedVideoSet] = useState<VideoSet | null>(null);

  return (
    <main>
      <section className={
        clsx(bgColor, textColor,
          "relative flex items-center justify-center h-screen overflow-hidden"
        )
      }>
        <div className='layout z-20 relative flex min-h-screen flex-col items-center justify-center p-4 text-center'>
          <div className='bg-white/40 backdrop-blur-sm rounded-lg px-8 py-6 shadow-lg'>
            <h1 className='mt-4 text-5xl mb-4'>
              <img
                src='/images/icon.png'
                alt='GrndCtrl icon'
                className="h-12 inline-block mr-3 align-middle"
                loading='lazy'
              />
              GrndCtrl: Grounding World Models via Self-Supervised Reward Alignment
            </h1>
            <div className='container pb-6 max-w-4xl mx-auto'>
              <div className='text-lg'>
                {authors.length > 0 ? (
                  <span className="text-gray-700">
                    {authors.map((author, index) => (
                      <span key={index}>
                        {index === authors.length - 3 && <br />}
                        {author.url ? (
                          <UnderlineLink
                            href={author.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900"
                          >
                            {author.name}
                          </UnderlineLink>
                        ) : (
                          <span className="text-gray-700">{author.name}</span>
                        )}
                        {author.affiliation && (
                          <sup className="text-gray-700 ml-0.5">{author.affiliation}</sup>
                        )}
                        {index < authors.length - 1 && (
                          <span className="text-gray-500 mx-1">,</span>
                        )}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-gray-500">[To be updated]</span>
                )}
              </div>
            </div>
            <div className="container flex flex-row items-center space-x-8 justify-center text-lg mt-6">
              <ArrowLink className='' href='#' variant="light" size='large' icon={
                <img
                  src='/svg/arxiv.svg'
                  alt='arXiv logo'
                  className={linkIconClass}
                  loading='lazy'
                />
              }>
                arXiv Page
              </ArrowLink>
              <ArrowLink className='' href='https://github.com/RLWG-GrndCtrl/RLWG-GrndCtrl.github.io' variant="light" size='large' icon={
                <img
                  src='/svg/github.svg'
                  alt='GitHub logo'
                  className={linkIconClass}
                  loading='lazy'
                />
              }>
                GitHub Repo
              </ArrowLink>
            </div>
          </div>
        </div>
        {/* Background Video */}
        {backgroundVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}
        {/* Background Image */}
        {!backgroundVideo && backgroundImage && (
          <img
            src={backgroundImage}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}
        {/* Default gray background (if no video/image) */}
        {!backgroundVideo && !backgroundImage && (
          <div className={clsx("absolute w-auto min-w-full min-h-full max-w-none z-10", maskColor)} />
        )}
        {/* Overlay for better text readability */}
        {(backgroundVideo || backgroundImage) && (
          <div className={clsx("absolute inset-0 z-10", backgroundOverlay)} />
        )}
        {/* Affiliations - Bottom Left */}
        <div className='absolute bottom-4 left-0 z-30 flex flex-row items-center gap-6 text-sm ml-2'>
          <div className='flex items-center gap-2'>
            <span className='text-gray-600 font-semibold text-xs'>1</span>
            <img src='/images/cmu.png' alt='Carnegie Mellon University' className='h-6' />
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-gray-600 font-semibold text-xs'>2</span>
            <img src='/images/fieldai.png' alt='Field AI' className='h-6' />
          </div>
        </div>
      </section>

      <section className={clsx(bgColor, textColor)}>
        <div className='layout py-12'>
          <h2 className='text-center pb-4'>Abstract</h2>
          <p className='text-pretty'>
            Recent advances in video world modeling have enabled large-scale generative models to simulate 
            embodied environments with high visual fidelity, providing strong priors for prediction, planning, 
            and control. Yet, despite their realism, these models often lack geometric grounding, limiting 
            their use in navigation tasks that require spatial coherence and long-horizon stability. We introduce 
            <b> Reinforcement Learning with World Grounding (RLWG)</b>, a self-supervised post-training framework 
            that aligns pretrained world models with a physically verifiable structure through geometric and 
            perceptual rewards. Analogous to reinforcement learning from verifiable feedback (RLVR) in language 
            models, RLWG can use multiple rewards that measure pose cycle-consistency, depth reprojection, and 
            temporal coherence. We instantiate this framework with <b>GrndCtrl</b>, a reward-aligned adaptation 
            method based on Group Relative Policy Optimization (GRPO), yielding world models that maintain stable 
            trajectories, consistent geometry, and reliable rollouts for embodied navigation. Like post-training 
            alignment in large language models, <b>GrndCtrl</b> leverages verifiable rewards to bridge generative 
            pretraining and grounded behavior, achieving superior spatial coherence and navigation stability over 
            supervised fine-tuning in outdoor environments.
          </p>
        </div>
      </section>

      <section className='bg-dark text-gray-200 py-8'>
        <div className='relative'>
            <div
              ref={sliderRef}
              className='flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 px-48 pb-2 scrollbar-dark'
              aria-label='GrndCtrl highlights slider'
            >
            {sliderItems.map((item) => (
              <article
                key={item.title}
                className='flex-none snap-center w-[85%] md:w-[70%] lg:w-[55%] bg-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur'
              >
                <h3 className='text-2xl font-semibold mb-4'>{item.title}</h3>
                {item.content}
              </article>
            ))}
          </div>
          <div className='pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-dark to-transparent' />
          <div className='pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-dark to-transparent' />
        </div>
      </section>

      <section className={clsx(secondaryBgColor, textColor)}>
        <div className='py-12'>
          <div className={`text-center ${selectedVideoSet ? 'mb-6' : 'mb-8'}`}>
            <h2 className='pb-4'>Qualitative Comparison</h2>
            {!selectedVideoSet && (
              <p className='text-gray-600'>
                Click to see comparisons of GrndCtrl with ground truth and baseline methods across different scenarios.
              </p>
            )}
            {selectedVideoSet && (
              <button
                onClick={() => setSelectedVideoSet(null)}
                className='text-gray-600 hover:text-gray-900 underline transition-transform hover:-translate-x-1 inline-flex items-center gap-1'
              >
                <span>←</span>
                <span>Back to all videos</span>
              </button>
            )}
          </div>
          
          <div className='relative'>
            {!selectedVideoSet ? (
              // Show scrollable row of baseline videos
              <div className='overflow-x-auto pb-4'>
                <div className='flex gap-6 px-48 min-w-max'>
                  {videoSets.map((videoSet) => (
                    <div
                      key={videoSet.folder}
                      onClick={() => setSelectedVideoSet(videoSet)}
                      className='flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity w-96'
                    >
                      <img
                        src={videoSet.groundTruth}
                        alt={`${videoSet.name} ground truth`}
                        className='w-full rounded-lg shadow-xl'
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Show the 2 comparison sliders for selected set
              <div className='px-48'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='flex flex-col'>
                    <ImageCompare
                      rightSrc={selectedVideoSet.groundTruth}
                      leftSrc={selectedVideoSet.baseline}
                      rightAlt={`${selectedVideoSet.name} ground truth`}
                      leftAlt={`${selectedVideoSet.name} baseline`}
                      rightLabel="Baseline (Counterfactual)"
                      leftLabel="Ground Truth"
                      leftLabelColor="#4A7EBB"
                      rightLabelColor="#C95C54"
                      className="w-full max-w-lg mx-auto"
                      fit="contain"
                    />
                  </div>
                  <div className='flex flex-col'>
                    <ImageCompare
                      rightSrc={selectedVideoSet.groundTruth}
                      leftSrc={selectedVideoSet.ours}
                      rightAlt={`${selectedVideoSet.name} ground truth`}
                      leftAlt={`${selectedVideoSet.name} ours`}
                      rightLabel="Ours (Counterfactual)"
                      leftLabel="Ground Truth"
                      leftLabelColor="#4A7EBB"
                      rightLabelColor="#5E9C76"
                      className="w-full max-w-lg mx-auto"
                      fit="contain"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className='pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-gray-100 to-transparent' />
            <div className='pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-gray-100 to-transparent' />
          </div>
        </div>
      </section>

      <section className={clsx(bgColor, textColor)}>
        <div className='layout py-12'>
          <h2 className='pb-4'>Method</h2>
          <Figure
            img_src="/images/grndctrl_fig2_v6.png"
            caption="Overview of GrndCtrl. RLWG refines pretrained world models using verifiable geometric and perceptual rewards. GrndCtrl instantiates RLWG using Group Relative Policy Optimization (GRPO) to optimize these rewards, enabling physically consistent rollouts."
            isDark={false}
            idx={1}
          />
        </div>
      </section>

      {/* <section className={clsx(secondaryBgColor, textColor)}>
        <div className='layout pt-4 pb-48'>
          <h2 className='mt-12 mb-4'>Citation</h2>
          <pre className='ml-12'>
            {citation_bibtex}
          </pre>
        </div>
      </section> */}
    </main >
  );
}
