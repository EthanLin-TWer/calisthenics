import { Application } from './main'

describe('MainApplication', () => {
  let application
  beforeEach(() => {
    application = new Application()
  })

  describe('publish', () => {
    it('employers should be able to publish a job', () => {
      const employer = {}
      const job = { name: '高级前端开发' }

      application.execute('publish', employer, job)
      const result = application.execute('getJobs', employer, null, 'published')

      expect(result).toEqual([{ name: '高级前端开发', type: 'JReq' }])
    })

    it('employers should be only able to see their published jobs', () => {
      const employer1 = { name: '招财猫' }
      const employer2 = { name: 'Sofie' }
      const experiencedFrontendDeveloperJob = { name: '高级前端开发' }
      const juniorFrontendDeveloperJob = { name: '前端开发' }

      application.execute('publish', employer1, experiencedFrontendDeveloperJob)
      application.execute('publish', employer2, juniorFrontendDeveloperJob)

      expect(
        application.execute('getJobs', employer1, null, 'published')
      ).toEqual([{ name: '高级前端开发', type: 'JReq' }])
      expect(
        application.execute('getJobs', employer2, null, 'published')
      ).toEqual([{ name: '前端开发', type: 'JReq' }])
    })

    it('employers should be able to publish multiple jobs ', () => {
      const employer = { name: '招财猫' }
      const experiencedFrontendDeveloperJob = { name: '高级前端开发' }
      const juniorFrontendDeveloperJob = { name: '前端开发' }

      application.execute('publish', employer, experiencedFrontendDeveloperJob)
      application.execute('publish', employer, juniorFrontendDeveloperJob)

      const result = application.execute('getJobs', employer, null, 'published')
      expect(result).toEqual([
        { name: '高级前端开发', type: 'JReq' },
        { name: '前端开发', type: 'JReq' },
      ])
    })

    it('employers should be able to publish a JReq type job', () => {
      const employer = { name: '招财猫' }
      const frontendDeveloperJob = { name: '高级前端开发', type: 'JReq' }

      application.execute('publish', employer, frontendDeveloperJob)

      const result = application.execute('getJobs', employer, null, 'published')
      expect(result).toEqual([{ name: '高级前端开发', type: 'JReq' }])
    })

    it('employers should be able to publish a ATS type job', () => {
      const employer = { name: '招财猫' }
      const frontendDeveloperJob = { name: '高级前端开发', type: 'ATS' }

      application.execute('publish', employer, frontendDeveloperJob)

      const result = application.execute('getJobs', employer, null, 'published')
      expect(result).toEqual([{ name: '高级前端开发', type: 'ATS' }])
    })

    it('employers should not be able to publish job that is neither JReq nor ATS', () => {
      const employer = { name: '招财猫' }
      // WTV means WhaTeVer
      const frontendDeveloperJob = { name: '高级前端开发', type: 'WTV' }

      expect(() =>
        application.execute('publish', employer, frontendDeveloperJob)
      ).toThrow('Job should either be JReq or ATS type.')
    })
  })

  describe('save', () => {
    it('jobseekers should be able to save a job so that he/she can re-visit', () => {
      const employer = { name: 'Alibaba', type: 'employer' }
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }
      const frontendDeveloperJob = {
        name: '高级前端开发',
        type: 'ATS',
        employer: 'Alibaba',
      }

      application.execute('publish', employer, frontendDeveloperJob)
      application.execute('save', null, frontendDeveloperJob, null, jobseeker)

      const result = application.execute(
        'getJobs',
        jobseeker,
        null,
        'published'
      )
      expect(result).toEqual([
        { name: '高级前端开发', type: 'ATS', employer: 'Alibaba' },
      ])
    })

    it('jobseekers should be able to save jobs published by different employers', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const tencent = { name: 'Tencent', type: 'employer' }
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }
      const frontendDeveloperJob = { name: '高级前端开发', type: 'ATS' }

      application.execute('publish', alibaba, frontendDeveloperJob)
      application.execute('publish', tencent, frontendDeveloperJob)
      application.execute(
        'save',
        null,
        {
          ...frontendDeveloperJob,
          employer: 'Tencent',
        },
        null,
        jobseeker
      )

      const result = application.execute(
        'getJobs',
        jobseeker,
        null,
        'published'
      )
      expect(result).toEqual([
        { name: '高级前端开发', type: 'ATS', employer: 'Tencent' },
      ])
    })
  })

  describe('application', () => {
    it('job seekers should be able to apply a job that some employer published', () => {
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }
      const employer = { name: 'ThoughtWorks', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'ATS' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }

      application.execute('publish', employer, backendDeveloperJob)
      application.execute('publish', employer, frontendDeveloperJob)
      application.execute('apply', null, backendDeveloperJob, null, jobseeker)
      application.execute('apply', null, frontendDeveloperJob, null, jobseeker)

      const result = application.execute('getJobs', jobseeker, null, 'applied')
      expect(result).toMatchObject([
        { name: '后端开发', type: 'ATS' },
        { name: '前端开发', type: 'ATS' },
      ])
    })

    it('job seekers should not be able to apply for a JReq job without a resume', () => {
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }
      const employer = { name: 'ThoughtWorks', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'JReq' }

      application.execute('publish', employer, frontendDeveloperJob)

      expect(() =>
        application.execute(
          'apply',
          null,
          frontendDeveloperJob,
          null,
          jobseeker
        )
      ).toThrow('A resume is required to apply for an JReq job.')
    })

    it('job seekers should be able to apply for a JReq job with a resume', () => {
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }
      const resume = { name: 'Jacky', skills: ['JavaScript'] }
      const employer = { name: 'ThoughtWorks', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'JReq' }

      application.execute('publish', employer, frontendDeveloperJob)
      application.execute(
        'apply',
        null,
        frontendDeveloperJob,
        null,
        jobseeker,
        resume
      )

      const applied = application.execute('getJobs', jobseeker, null, 'applied')
      expect(applied).toMatchObject([{ name: '前端开发', type: 'JReq' }])
    })

    it("job seekers should not use someone else's resume to apply for a job", () => {
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }
      const fakeResume = { name: 'Jack', skills: ['Sales'] }
      const employer = { name: 'ThoughtWorks', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'JReq' }

      application.execute('publish', employer, frontendDeveloperJob)

      expect(() =>
        application.execute(
          'apply',
          null,
          frontendDeveloperJob,
          null,
          jobseeker,
          fakeResume
        )
      ).toThrow('Use your own resume for your application.')
    })

    it('job seekers should be able to apply for jobs using different resumes', () => {
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }
      const frontendResume = {
        name: 'Jacky',
        skills: ['JavaScript', 'Angular 8'],
      }
      const backendResume = { name: 'Jacky', skills: ['Java', 'Sprint Boot'] }
      const employer = { name: 'ThoughtWorks', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'JReq' }
      const backendDeveloperJob = { name: '后端开发', type: 'JReq' }

      application.execute('publish', employer, frontendDeveloperJob)
      application.execute('publish', employer, backendDeveloperJob)
      application.execute(
        'apply',
        null,
        frontendDeveloperJob,
        null,
        jobseeker,
        frontendResume
      )
      application.execute(
        'apply',
        null,
        backendDeveloperJob,
        null,
        jobseeker,
        backendResume
      )

      const jobs = application.execute('getJobs', jobseeker, null, 'applied')
      expect(jobs).toMatchObject([
        {
          name: '前端开发',
          type: 'JReq',
        },
        {
          name: '后端开发',
          type: 'JReq',
        },
      ])
    })
  })

  describe('print', () => {
    it('job seekers should be able to view applied jobs and saved jobs separately', () => {
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }
      const employer = { name: 'ThoughtWorks', type: 'employer' }
      const frontendDeveloperJob = {
        name: '前端开发',
        type: 'ATS',
        employer: 'ThoughtWorks',
      }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }

      application.execute('publish', employer, backendDeveloperJob)
      application.execute('publish', employer, frontendDeveloperJob)
      application.execute('apply', null, backendDeveloperJob, null, jobseeker)
      application.execute('save', null, frontendDeveloperJob, null, jobseeker)

      const applied = application.execute('getJobs', jobseeker, null, 'applied')
      expect(applied).toMatchObject([
        { name: '后端开发', type: 'ATS', employer: 'ThoughtWorks' },
      ])

      const saved = application.execute('getJobs', jobseeker, null, 'saved')
      expect(saved).toMatchObject([
        { name: '前端开发', type: 'ATS', employer: 'ThoughtWorks' },
      ])
    })

    it('employers should be able to see applicants for a published job', () => {
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const employer = { name: 'ThoughtWorks', type: 'employer' }
      const job = { name: '前端开发', type: 'ATS' }

      application.execute('publish', employer, job)
      application.execute('apply', null, job, null, jobseeker1)
      application.execute('apply', null, job, null, jobseeker2)

      const applicants = application.execute(
        'getApplicants',
        employer,
        null,
        null,
        null,
        null,
        null,
        '前端开发',
        null,
        null,
        null,
        'desc'
      )

      expect(applicants).toMatchObject([
        { name: 'Jacky', type: 'job-seeker' },
        { name: 'Lam', type: 'job-seeker' },
      ])
    })

    it('employers should not see job applicants that are published by other employers', () => {
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const thoughtWorks = { name: 'ThoughtWorks', type: 'employer' }
      const frontendJob = { name: '前端开发', type: 'ATS' }

      const alibaba = { name: 'Alibaba', type: 'employer' }
      const experiencedFrontendJob = { name: '高级前端开发', type: 'ATS' }

      application.execute('publish', thoughtWorks, frontendJob)
      application.execute('apply', null, frontendJob, null, jobseeker1)
      application.execute('apply', null, frontendJob, null, jobseeker2)

      application.execute('publish', alibaba, experiencedFrontendJob)
      application.execute(
        'apply',
        null,
        experiencedFrontendJob,
        null,
        jobseeker1
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '高级前端开发',
        null,
        null,
        null,
        'desc'
      )

      expect(applicants).toMatchObject([{ name: 'Jacky', type: 'job-seeker' }])
    })

    it('employers should be able to see job counts applied successfully', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }
      const jobseekerJacky = { name: 'Jacky', type: 'job-seeker' }
      const jobseekerLam = { name: 'Lam', type: 'job-seeker' }

      application.execute('publish', alibaba, backendDeveloperJob)
      application.execute(
        'apply',
        null,
        backendDeveloperJob,
        null,
        jobseekerJacky,
        null
      )
      application.execute(
        'apply',
        null,
        backendDeveloperJob,
        null,
        jobseekerLam,
        null
      )

      const result = application.execute(
        'getApplicantCounts',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '后端开发'
      )

      expect(result.successful).toEqual(2)
    })

    it.skip('employers should not see applicant counts for a published job given the job is published by other employers', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const tencent = { name: 'Tencent', type: 'employer' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }
      const jobseekerJacky = { name: 'Jacky', type: 'job-seeker' }
      const jobseekerLam = { name: 'Lam', type: 'job-seeker' }

      application.execute('publish', alibaba, backendDeveloperJob)
      application.execute('publish', tencent, backendDeveloperJob)
      // TODO: [Linesh][2020-02-03] you can not specify employer of the job here right now
      application.execute(
        'apply',
        null,
        backendDeveloperJob,
        null,
        jobseekerJacky,
        null
      )
      application.execute(
        'apply',
        null,
        backendDeveloperJob,
        null,
        jobseekerLam,
        null
      )

      const result = application.execute(
        'getApplicantCounts',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '后端开发'
      )

      expect(result).toEqual(2)
    })

    it('employers should be able to see total jobs applied(success and un-success) and unsuccessful applications', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const backendDeveloperJob = { name: '后端开发', type: 'JReq' }
      const jobseekerJacky = { name: 'Jacky', type: 'job-seeker' }
      const resume = {
        name: 'Lam',
        skills: ['JavaScript'],
      }
      const jobseekerLam = { name: 'Lam', type: 'job-seeker' }

      application.execute('publish', alibaba, backendDeveloperJob)
      try {
        application.execute(
          'apply',
          null,
          backendDeveloperJob,
          null,
          jobseekerJacky,
          null
        )
        // eslint-disable-next-line no-empty
      } catch (error) {}
      application.execute(
        'apply',
        null,
        backendDeveloperJob,
        null,
        jobseekerLam,
        resume
      )

      const result = application.execute(
        'getApplicantCounts',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '后端开发'
      )

      expect(result).toEqual({
        successful: 1,
        unsuccessful: 1,
        total: 2,
      })
    })
  })

  describe('filter', () => {
    it('employers should be able to filter job seekers by application period for a specific job in desc order', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const job = { name: '高级前端开发', type: 'ATS' }
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const jobseeker3 = { name: 'Tam', type: 'job-seeker' }

      application.execute('publish', alibaba, job)
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker1,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker2,
        null,
        new Date('2019-12-21')
      )
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker3,
        null,
        new Date('2019-12-22')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '高级前端开发',
        'date',
        '2019-12-20',
        '2019-12-21',
        'desc'
      )

      expect(applicants).toEqual([
        {
          name: 'Lam',
          type: 'job-seeker',
          applicationTime: '2019-12-21T00:00:00.000Z',
        },
        {
          name: 'Jacky',
          type: 'job-seeker',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
      ])
    })

    it('employers should be able to filter job seekers by application period for a specific job in asc order', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const job = { name: '高级前端开发', type: 'ATS' }
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const jobseeker3 = { name: 'Tam', type: 'job-seeker' }

      application.execute('publish', alibaba, job)
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker1,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker2,
        null,
        new Date('2019-12-21')
      )
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker3,
        null,
        new Date('2019-12-22')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '高级前端开发',
        'date',
        '2019-12-20',
        '2019-12-21',
        'asc'
      )

      expect(applicants).toEqual([
        {
          name: 'Jacky',
          type: 'job-seeker',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
        {
          name: 'Lam',
          type: 'job-seeker',
          applicationTime: '2019-12-21T00:00:00.000Z',
        },
      ])
    })

    it.skip('employers should not be able to filter job seekers by application period for a specific job in desc order given job is published by other employers', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const tencent = { name: 'Tencent', type: 'employer' }
      const jobByAlibaba = {
        name: '高级前端开发',
        type: 'ATS',
        employer: 'Alibaba',
      }
      const jobByTencent = {
        name: '高级前端开发',
        type: 'ATS',
        employer: 'Tencent',
      }
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const jobseeker3 = { name: 'Tam', type: 'job-seeker' }

      application.execute('publish', alibaba, jobByAlibaba)
      application.execute('publish', tencent, jobByTencent)
      application.execute(
        'apply_withTime',
        null,
        jobByAlibaba,
        null,
        jobseeker1,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        jobByTencent,
        null,
        jobseeker2,
        null,
        new Date('2019-12-21')
      )
      application.execute(
        'apply_withTime',
        null,
        jobByAlibaba,
        null,
        jobseeker3,
        null,
        new Date('2019-12-22')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '高级前端开发',
        'date',
        '2019-12-20',
        '2019-12-21',
        'desc'
      )

      expect(applicants).toEqual([
        {
          name: 'Jacky',
          type: 'job-seeker',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
      ])
    })

    it('employers should be able to filter job seekers by application time that is requested after a specific time', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const job = { name: '高级前端开发', type: 'ATS' }
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const jobseeker3 = { name: 'Tam', type: 'job-seeker' }

      application.execute('publish', alibaba, job)
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker1,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker2,
        null,
        new Date('2019-12-22')
      )
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker3,
        null,
        new Date('2019-12-21')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '高级前端开发',
        'date',
        '2019-12-20',
        null,
        'asc'
      )

      expect(applicants).toEqual([
        {
          name: 'Jacky',
          type: 'job-seeker',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
        {
          name: 'Tam',
          type: 'job-seeker',
          applicationTime: '2019-12-21T00:00:00.000Z',
        },
        {
          name: 'Lam',
          type: 'job-seeker',
          applicationTime: '2019-12-22T00:00:00.000Z',
        },
      ])
    })

    it('employers should be able to filter job seekers by application time that is requested before a specific time', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const job = { name: '高级前端开发', type: 'ATS' }
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const jobseeker3 = { name: 'Tam', type: 'job-seeker' }

      application.execute('publish', alibaba, job)
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker1,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker2,
        null,
        new Date('2019-12-22')
      )
      application.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobseeker3,
        null,
        new Date('2019-12-21')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        '高级前端开发',
        'date',
        null,
        '2019-12-21',
        'desc'
      )

      expect(applicants).toEqual([
        {
          name: 'Tam',
          type: 'job-seeker',
          applicationTime: '2019-12-21T00:00:00.000Z',
        },
        {
          name: 'Jacky',
          type: 'job-seeker',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
      ])
    })

    it('employers should be able to filter job seekers applied later than a specific time', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'ATS' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const jobseeker3 = { name: 'Tam', type: 'job-seeker' }

      application.execute('publish', alibaba, frontendDeveloperJob)
      application.execute('publish', alibaba, backendDeveloperJob)
      application.execute(
        'apply_withTime',
        null,
        frontendDeveloperJob,
        null,
        jobseeker1,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseeker2,
        null,
        new Date('2019-12-22')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseeker3,
        null,
        new Date('2019-12-21')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        null,
        'date',
        null,
        '2019-12-21',
        'desc'
      )

      expect(applicants).toEqual([
        {
          name: 'Tam',
          type: 'job-seeker',
          applicationTime: '2019-12-21T00:00:00.000Z',
        },
        {
          name: 'Jacky',
          type: 'job-seeker',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
      ])
    })

    it('employers should be able to filter job seekers applied before a specific time', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'ATS' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const jobseeker3 = { name: 'Tam', type: 'job-seeker' }

      application.execute('publish', alibaba, frontendDeveloperJob)
      application.execute('publish', alibaba, backendDeveloperJob)
      application.execute(
        'apply_withTime',
        null,
        frontendDeveloperJob,
        null,
        jobseeker1,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseeker2,
        null,
        new Date('2019-12-22')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseeker3,
        null,
        new Date('2019-12-21')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        null,
        'date',
        '2019-12-20',
        null,
        'asc'
      )

      expect(applicants).toEqual([
        {
          name: 'Jacky',
          type: 'job-seeker',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
        {
          name: 'Tam',
          type: 'job-seeker',
          applicationTime: '2019-12-21T00:00:00.000Z',
        },
        {
          name: 'Lam',
          type: 'job-seeker',
          applicationTime: '2019-12-22T00:00:00.000Z',
        },
      ])
    })

    it('employers should be able to filter job seekers applied during a time period', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'ATS' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }
      const jobseeker1 = { name: 'Jacky', type: 'job-seeker' }
      const jobseeker2 = { name: 'Lam', type: 'job-seeker' }
      const jobseeker3 = { name: 'Tam', type: 'job-seeker' }

      application.execute('publish', alibaba, frontendDeveloperJob)
      application.execute('publish', alibaba, backendDeveloperJob)
      application.execute(
        'apply_withTime',
        null,
        frontendDeveloperJob,
        null,
        jobseeker1,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseeker2,
        null,
        new Date('2019-12-22')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseeker3,
        null,
        new Date('2019-12-21')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        null,
        'date',
        '2019-12-20',
        '2019-12-21',
        'asc'
      )

      expect(applicants).toEqual([
        {
          name: 'Jacky',
          type: 'job-seeker',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
        {
          name: 'Tam',
          type: 'job-seeker',
          applicationTime: '2019-12-21T00:00:00.000Z',
        },
      ])
    })

    it('employers should be able to check jobs applied by a job seeker in a given day', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'ATS' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }
      const devopsDeveloperJob = { name: 'DevOps', type: 'ATS' }
      const jobseeker = { name: 'Jacky', type: 'job-seeker' }

      application.execute('publish', alibaba, frontendDeveloperJob)
      application.execute('publish', alibaba, backendDeveloperJob)
      application.execute('publish', alibaba, devopsDeveloperJob)
      application.execute(
        'apply_withTime',
        null,
        frontendDeveloperJob,
        null,
        jobseeker,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        devopsDeveloperJob,
        null,
        jobseeker,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseeker,
        null,
        new Date('2019-12-21')
      )

      const applicants = application.execute(
        'getApplicants',
        alibaba,
        null,
        null,
        null,
        null,
        null,
        null,
        'job',
        '2019-12-20',
        null,
        'desc'
      )

      expect(applicants).toEqual([
        {
          name: '前端开发',
          type: 'ATS',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
        {
          name: 'DevOps',
          type: 'ATS',
          applicationTime: '2019-12-20T00:00:00.000Z',
        },
      ])
    })
  })

  describe('export', () => {
    it('employers should be able to export job applications as csv', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const tencent = { name: 'Tencent', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'ATS' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }
      const devopsDeveloperJob = { name: 'DevOps', type: 'ATS' }
      const jobseekerJacky = { name: 'Jacky', type: 'job-seeker' }
      const jobseekerLam = { name: 'Lam', type: 'job-seeker' }

      application.execute('publish', alibaba, frontendDeveloperJob)
      application.execute('publish', alibaba, backendDeveloperJob)
      application.execute('publish', tencent, devopsDeveloperJob)
      application.execute(
        'apply_withTime',
        null,
        frontendDeveloperJob,
        null,
        jobseekerJacky,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseekerJacky,
        null,
        new Date('2019-12-21')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseekerLam,
        null,
        new Date('2019-12-29')
      )
      application.execute(
        'apply_withTime',
        null,
        devopsDeveloperJob,
        null,
        jobseekerLam,
        null,
        new Date('2019-12-29')
      )

      const result = application.execute('exportAsCSV')

      expect(result).toEqual(
        'Employer,Job,Job Type,Applicants,Date\n' +
          'Alibaba,前端开发,ATS,Jacky,2019-12-20\n' +
          'Alibaba,后端开发,ATS,Jacky,2019-12-21\n' +
          'Alibaba,后端开发,ATS,Lam,2019-12-29\n' +
          'Tencent,DevOps,ATS,Lam,2019-12-29\n'
      )
    })

    it('employers should be able to export job applications as html', () => {
      const alibaba = { name: 'Alibaba', type: 'employer' }
      const tencent = { name: 'Tencent', type: 'employer' }
      const frontendDeveloperJob = { name: '前端开发', type: 'ATS' }
      const backendDeveloperJob = { name: '后端开发', type: 'ATS' }
      const devopsDeveloperJob = { name: 'DevOps', type: 'ATS' }
      const jobseekerJacky = { name: 'Jacky', type: 'job-seeker' }
      const jobseekerLam = { name: 'Lam', type: 'job-seeker' }

      application.execute('publish', alibaba, frontendDeveloperJob)
      application.execute('publish', alibaba, backendDeveloperJob)
      application.execute('publish', tencent, devopsDeveloperJob)
      application.execute(
        'apply_withTime',
        null,
        frontendDeveloperJob,
        null,
        jobseekerJacky,
        null,
        new Date('2019-12-20')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseekerJacky,
        null,
        new Date('2019-12-21')
      )
      application.execute(
        'apply_withTime',
        null,
        backendDeveloperJob,
        null,
        jobseekerLam,
        null,
        new Date('2019-12-29')
      )
      application.execute(
        'apply_withTime',
        null,
        devopsDeveloperJob,
        null,
        jobseekerLam,
        null,
        new Date('2019-12-29')
      )

      const result = application.execute('exportAsHTML')

      // prettier-ignore
      expect(result).toEqual(
        '<table>' +
          '<thead>' +
            '<tr>' +
              '<th>Employer</th>' +
              '<th>Job Description</th>' +
              '<th>Job Type</th>' +
              '<th>Applicant</th>' +
              '<th>Application Time</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr>' +
              '<td>Alibaba</td>' +
              '<td>前端开发</td>' +
              '<td>ATS</td>' +
              '<td>Jacky</td>' +
              '<td>2019-12-20</td>' +
            '</tr>' +
            '<tr>' +
              '<td>Alibaba</td>' +
              '<td>后端开发</td>' +
              '<td>ATS</td>' +
              '<td>Jacky</td>' +
              '<td>2019-12-21</td>' +
            '</tr>' +
            '<tr>' +
              '<td>Alibaba</td>' +
              '<td>后端开发</td>' +
              '<td>ATS</td>' +
              '<td>Lam</td>' +
              '<td>2019-12-29</td>' +
            '</tr>' +
            '<tr>' +
              '<td>Tencent</td>' +
              '<td>DevOps</td>' +
              '<td>ATS</td>' +
              '<td>Lam</td>' +
              '<td>2019-12-29</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      )
    })
  })
})
