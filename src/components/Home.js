import Image from 'next/image'
import { MapPin } from 'react-feather'
import { Detail } from './Detail'

function SectionTitle(props) {
  return (
    <h4
      className="col-span-2 text-lg font-semibold text-primary md:text-right md:text-base md:font-normal md:text-opacity-40"
      {...props}
    />
  )
}

function SectionContent(props) {
  return <div className="col-span-10" {...props} />
}

function TableRow({ href, title, subtitle, date }) {
  return (
    <a
      href={href}
      className="flex items-center space-x-4 group"
    >
      <strong className="flex-none font-medium text-gray-900 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-500">
        {title}
      </strong>
      <span className="w-full border-t border-gray-300 border-dashed shrink dark:border-gray-800" />
      {subtitle && <span className="flex-none text-tertiary text-sm md:text-base">{subtitle}</span>}
      {date && <span className="flex-none font-mono text-quaternary hidden md:flex">{date}</span>}
    </a>
  )
}

function SectionContainer(props) {
  return (
    <div
      className="grid items-start grid-cols-1 md:grid-cols-12 gap-3 md:gap-6"
      {...props}
    />
  )
}

export function Home() {
  return (
    <Detail.Container>
      <Detail.ContentContainer>
        {/* Avatar */}
        {/* <div className="justify-center flex mb-6 md:ml-20 dark:hidden">
          <Image
            src="/static/img/avatar.png"
            alt="Sai Surbehera"
            width={200}
            height={200}
            quality={100}
          />
        </div> */}

        <div className="pb-24 md:pb-4 space-y-12 md:space-y-16 dark:mt-8">
          {/* Bio */}
          <SectionContainer>
            <SectionTitle />
            <SectionContent>
              <div className="prose -mb-8">
                <p>
                  Hello, My name is Sai! I am an Machine Learning Engineer for Walmart's Algorithmic Search Re-rank Team. I specifically work on cold start and CTR prediction models. </p><p> I graduated from Columbia University with a Masters in Computer Science and my undergraduate degree in Information from the University of Michigan.
                  </p><p>
                   On my freetime, i work on my projects, read and write about philosophy, and listen to music. 
                </p>
                <p className="-mb-2">
                  In the past, I've worked on:
                </p>
                <ul>
                  <li> Price prediction algorithms at <a href="https://www.walmart.com/">Walmart</a></li>
                  <li> Geo-coding algorithms at <a href="https://www.inquirer.com/">Philadelpha Inquier</a> and Columbia Journalism</li>
                  <li> Information Extraction pipelines at <a href="https://www.amfam.com/">American Family Insurance</a></li>
                  <li> Relation Extraction pipelines at <a href="https://www.mindgram.ai/">Mindgram</a></li>
                  <li> Knowledge Graph search and Entity linking systems at <a href="https://umich.edu/giving/">University of Michigan Giving</a></li>
                  <li> Theme-matching algorithms and summarization at  <a href="https://www.sun.ac.za/english">University of Stellenbosch</a></li>
                  <li>Fraud detection using GraphSage at <a href="https://www.acg.aaa.com/">AAA Insurance</a></li>
                </ul>
              </div>
            </SectionContent>
          </SectionContainer>

          {/* Socials */}
          <SectionContainer>
            <SectionTitle>Online</SectionTitle>
            <SectionContent>
              <div className="flex flex-col space-y-3">
                <TableRow
                  href={'mailto:ss6365@columbia.com'}
                  title={'Email'}
                  subtitle={'Send'}
                  date={''}
                />
                <TableRow
                  href={'https://github.com/saisurbehera'}
                  title={'GitHub'}
                  subtitle={'Follow'}
                  date={''}
                />
              </div>
            </SectionContent>
          </SectionContainer>

          {/* Where */}
          <SectionContainer>
            <SectionTitle>Where</SectionTitle>
            <SectionContent>
              <Image
                priority
                src="/static/img/nyc.png"
                width={1290}
                height={893}
                layout="responsive"
                className="rounded-xl"
                quality={100}
                alt="Map of NYC with blue location dot in the middle"
              />
              <p className="flex items-center justify-end pt-2 space-x-2 text-sm text-quaternary md:text-right">
                <MapPin size={12} />
                <span>NYC</span>
              </p>
            </SectionContent>
          </SectionContainer>

          {/* Spotify Widget */}
          {/* <SectionContainer>
            <SectionTitle>Music</SectionTitle>
            <SectionContent>
              <iframe className="rounded-xl" src="https://open.spotify.com/embed/playlist/12DxIGMOK6o2ZQ5PdT8Hzv?utm_source=generator" width="100%" height="380" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
            </SectionContent>
          </SectionContainer> */}
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}
