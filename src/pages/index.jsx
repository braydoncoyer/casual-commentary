import { Container } from '@/components/Container'
import { FormattedDate } from '@/components/FormattedDate'
import Head from 'next/head'
import Link from 'next/link'
import { parse } from 'rss-to-json'
import { useAudioPlayer } from '@/components/AudioProvider'
import { useMemo } from 'react'

function PlayPauseIcon({ playing, ...props }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" fill="none" {...props}>
      {playing ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.496 0a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H2.68a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H1.496Zm5.82 0a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H8.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H7.316Z"
        />
      ) : (
        <path d="M8.25 4.567a.5.5 0 0 1 0 .866l-7.5 4.33A.5.5 0 0 1 0 9.33V.67A.5.5 0 0 1 .75.237l7.5 4.33Z" />
      )}
    </svg>
  )
}

function EpisodeEntry({ episode }) {
  let date = new Date(episode.published)

  let audioPlayerData = useMemo(
    () => ({
      title: episode.title,
      audio: {
        src: episode.audio.src,
        type: episode.audio.type,
      },
      link: `/${episode.id}`,
    }),
    [episode]
  )
  let player = useAudioPlayer(audioPlayerData)

  return (
    <article
      aria-labelledby={`episode-${episode.id}-title`}
      className="py-10 sm:py-12 bg-slate-900"
    >
      <Container>
        <div className="flex flex-col items-start">
          <h2
            id={`episode-${episode.id}-title`}
            className="mt-2 text-lg font-bold text-slate-100"
          >
            {episode.title}
          </h2>
          <FormattedDate
            date={date}
            className="order-first font-mono text-sm leading-7 text-slate-500"
          />
          <p className="mt-1 text-base leading-7 text-slate-300">
            {episode.description}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => player.toggle()}
              className="flex items-center text-sm font-bold leading-6 text-pink-500 hover:text-pink-700 active:text-pink-900"
              aria-label={`${player.playing ? 'Pause' : 'Play'} episode ${
                episode.title
              }`}
            >
              <PlayPauseIcon
                playing={player.playing}
                className="h-2.5 w-2.5 fill-current"
              />
              <span className="ml-3" aria-hidden="true">
                Listen
              </span>
            </button>
          </div>
        </div>
      </Container>
    </article>
  )
}

export default function Home({ episodes }) {
  return (
    <>
      <Head>
        <title>Casual Commentary - Conversations about modern media.</title>
        <meta
          name="description"
          content="Unscripted discussions about modern media."
        />
      </Head>
      <div className="pt-16 pb-12 sm:pb-4 lg:pt-12">
        <Container>
          <h1 className="text-2xl font-bold leading-7 text-slate-200">
            Episodes
          </h1>
        </Container>
        <div className="divide-y divide-slate-700 sm:mt-4 lg:mt-8 lg:border-t lg:border-slate-100">
          {episodes.map((episode) => (
            <EpisodeEntry key={episode.title} episode={episode} />
          ))}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  let rss = await parse('https://anchor.fm/s/2d4d2588/podcast/rss');

  /**
   * Remove any HTML tags from the description string provided from Anchor
   */
  rss.items.forEach(item => {
    let newDescription = item.description.replace(/(<([^>]+)>)/gi, '').slice(0, -7);
    item.description = newDescription;
  })

  return {
    props: {
      episodes: rss.items.map(
        ({ title, description, enclosures, published }, index) => ({
          id: `${rss.items.length - index}`,
          title: `${rss.items.length - index}. ${title}`,
          published,
          description,
          audio: enclosures.map((enclosure) => ({
            src: enclosure.url,
            type: enclosure.type,
          }))[0],
        })
      ),
    },
    revalidate: 10,
  }
}
