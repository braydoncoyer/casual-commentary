import { Container } from '@/components/Container'
import { FormattedDate } from '@/components/FormattedDate'
import Head from 'next/head'
import { PlayButton } from '@/components/player/PlayButton'
import { parse } from 'rss-to-json'
import { useAudioPlayer } from '@/components/AudioProvider'
import { useMemo } from 'react'

export default function Episode({ episode }) {
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
    <>
      <Head>
        <title>{`${episode.title} - Casual Commentary`}</title>
        <meta name="description" content={episode.description} />
      </Head>
      <article className="py-16 lg:py-36">
        <Container>
          <header className="flex flex-col">
            <div className="flex items-center gap-6">
              <PlayButton player={player} size="large" />
              <div className="flex flex-col">
                <h1 className="mt-2 text-4xl font-bold text-slate-100">
                  {episode.title}
                </h1>
                <FormattedDate
                  date={date}
                  className="order-first font-mono text-sm leading-7 text-slate-500"
                />
              </div>
            </div>
            <p className="mt-3 ml-24 text-lg font-medium leading-8 text-slate-300">
              {episode.description}
            </p>
          </header>
          <hr className="my-12 border-gray-200" />
          <div
            className="prose mt-14 text-slate-300 [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm [&>h2]:font-medium [&>h2]:leading-7 [&>h2]:text-slate-100 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-cyan-200 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 [&>h2:nth-of-type(3n)]:before:bg-violet-200"
            dangerouslySetInnerHTML={{ __html: episode.content }}
          />
        </Container>
      </article>
    </>
  )
}

export async function getStaticProps({ params }) {
  let feed = await parse('https://anchor.fm/s/2d4d2588/podcast/rss')
  let episodes = generateEpisodeIds(feed.items)
  let episode = episodes
    .map(({ id, title, description, content, enclosures, published }, index) => ({
      id: id,
      title: `${id}: ${title}`,
      description,
      content,
      published,
      audio: enclosures.map((enclosure) => ({
        src: enclosure.url,
        type: enclosure.type,
      }))[0],
    }))
    .find(({ id }) => id === params.episode)

  if (!episode) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      episode,
    },
    revalidate: 10,
  }
}

export async function getStaticPaths() {
  let feed = await parse('https://anchor.fm/s/2d4d2588/podcast/rss')

  let episodes = generateEpisodeIds(feed.items)

  return {
    paths: episodes.map(({ id }) => ({
      params: {
        episode: id,
      },
    })),
    fallback: 'blocking',
  }
}


function generateEpisodeIds(episodes) {
  return  episodes.map((episode, index) => {
    return episode.id = episodes.length - index;
  });
}