import assert from 'assert'
import { flatMap, groupBy } from './utils'

export class Application {
  jobs = {}
  applied = {}
  failedApplications = []

  execute(
    command,
    employer,
    job,
    type,
    jobSeeker,
    resume,
    applicationTime,
    jobName,
    groupCondition,
    from,
    to,
    order = 'desc'
  ) {
    if (command === 'publish') {
      job.type = job.type || 'JReq'
      if (job.type !== 'JReq' && job.type !== 'ATS') {
        throw 'Job should either be JReq or ATS type.'
      } else {
        const published = this.jobs[employer.name] || []
        this.jobs[employer.name] = published.concat(job)
      }
    }

    if (command === 'getJobs') {
      if (type === 'applied') {
        return this.applied[employer.name]
      }
      return this.jobs[employer.name]
    }

    if (command === 'apply') {
      this.execute(
        'apply_withTime',
        null,
        job,
        null,
        jobSeeker,
        resume,
        new Date()
      )
    }

    if (command === 'apply_withTime') {
      if (job.type === 'JReq' && !resume) {
        this.failedApplications.push({
          jobSeeker,
          job,
          applicationTime,
          reason: 'No Resume',
        })
        throw 'A resume is required to apply for an JReq job.'
      } else if (!(job.type !== 'ATS' && jobSeeker.name !== resume.name)) {
        const saved = this.applied[jobSeeker.name] || []
        const jobs = flatMap(
          Object.entries(this.jobs).map(([employerrr, publishedJobs]) =>
            publishedJobs.map((published) => ({
              ...published,
              employer: employerrr,
            }))
          )
        )
        const { employer: actualEmployer } = jobs.find(
          (published) => job.name === published.name
        )
        this.applied[jobSeeker.name] = saved.concat({
          ...job,
          applicationTime,
          employer: actualEmployer,
        })
      } else {
        throw 'Use your own resume for your application.'
      }
    }

    if (command === 'save') {
      assert(job.hasOwnProperty('employer'))
      const saved = this.jobs[jobSeeker.name] || []
      this.jobs[jobSeeker.name] = saved.concat(job)
    }

    if (command === 'getApplicants') {
      let found = Object.entries(this.applied)
        .map(([jobSeekerName, jobs]) =>
          jobs.map((job) => ({ ...job, jobSeekerName }))
        )
        .reduce((a, b) => a.concat(b), [])

      if (jobName !== null) {
        found = found.filter((job) => job.name === jobName)
      }

      let result = found.map((job) => ({
        name: job.jobSeekerName,
        type: 'job-seeker',
        applicationTime: job.applicationTime,
        employer: job.employer,
      }))

      if (groupCondition === 'job') {
        if (order === 'desc') {
          result = found.filter((job) => job.applicationTime <= new Date(from))
          return (
            result
              .sort((job, another) =>
                job.applicationTime >= another.applicationTime ? 1 : -1
              )
              // eslint-disable-next-line no-unused-vars
              .map(({ jobSeekerName, employer, ...rest }) => ({
                ...rest,
                applicationTime: rest.applicationTime.toISOString(),
              }))
          )
        }
        result = found.filter((job) => job.applicationTime === new Date(from))
        return (
          result
            .sort((job, another) =>
              job.applicationTime < another.applicationTime ? 1 : -1
            )
            // eslint-disable-next-line no-unused-vars
            .map(({ jobSeekerName, employer, ...rest }) => ({
              ...rest,
              applicationTime: rest.applicationTime.toISOString(),
            }))
        )
      }

      if (groupCondition === 'date') {
        if (to === null) {
          result = result.filter(
            (job) =>
              job.applicationTime >= new Date(from) &&
              job.applicationTime <= Date.now()
          )
        } else if (from === null) {
          result = result.filter((job) => job.applicationTime <= new Date(to))
        } else {
          result = result.filter(
            (job) =>
              job.applicationTime >= new Date(from) &&
              job.applicationTime <= new Date(to)
          )
        }

        if (order === 'desc') {
          return result
            .sort((job, another) =>
              job.applicationTime < another.applicationTime ? 1 : -1
            )
            .map((job) => {
              const { employer: something, ...rest } = job
              return {
                ...rest,
                applicationTime: job.applicationTime.toISOString(),
              }
            })
        }

        return result
          .sort((job, another) =>
            job.applicationTime >= another.applicationTime ? 1 : -1
          )
          .map((job) => {
            const { employer: something, ...rest } = job
            return {
              ...rest,
              applicationTime: job.applicationTime.toISOString(),
            }
          })
      }

      return result.map((job) => {
        const { employer: something, ...rest } = job
        return {
          ...rest,
          applicationTime: job.applicationTime.toISOString(),
        }
      })
    }

    if (command === 'getApplicantCounts') {
      const { length: successfulApplications } = flatMap(
        Object.values(this.applied)
      ).filter((job) => job.name === jobName)

      return {
        successful: successfulApplications,
        unsuccessful: this.failedApplications.length,
        total: successfulApplications + this.failedApplications.length,
      }
    }

    if (command === 'exportAsCSV') {
      const appliedJobs = groupBy(
        flatMap(
          Object.entries(this.applied).map(([applicant, jobs]) =>
            jobs.map((job) => ({ ...job, applicant }))
          )
        ),
        'name'
      )
      return `Employer,Job,Job Type,Applicants,Date\n${Object.values(
        appliedJobs
      )
        .map((jobs) =>
          jobs
            .map(
              (job) =>
                `${job.employer},${job.name},${job.type},${
                  job.applicant
                },${job.applicationTime.toISOString().substring(0, 10)}\n`
            )
            .join('')
        )
        .join('')}`
    }

    if (command === 'exportAsHTML') {
      const appliedJobs = groupBy(
        flatMap(
          Object.entries(this.applied).map(([applicant, jobs]) =>
            jobs.map((job) => ({ ...job, applicant }))
          )
        ),
        'name'
      )
      const tableContent = Object.values(appliedJobs)
        .map((jobs) =>
          jobs
            .map((job) => {
              const content = `<td>${job.employer}</td><td>${
                job.name
              }</td><td>${job.type}</td><td>${
                job.applicant
              }</td><td>${job.applicationTime
                .toISOString()
                .substring(0, 10)}</td>`
              return `<tr>${content}</tr>`
            })
            .join('')
        )
        .join('')
      return `<table><thead><tr><th>Employer</th><th>Job Description</th><th>Job Type</th><th>Applicant</th><th>Application Time</th></tr></thead><tbody>${tableContent}</tbody></table>`
    }
  }
}
