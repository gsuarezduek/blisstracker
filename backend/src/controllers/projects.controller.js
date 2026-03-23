const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const includeServices = {
  services: { include: { service: true }, orderBy: { service: { name: 'asc' } } },
}

async function list(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: includeServices,
    })
    res.json(projects)
  } catch (err) { next(err) }
}

async function listAll(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
      include: includeServices,
    })
    res.json(projects)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { name, serviceIds = [] } = req.body
    if (!name) return res.status(400).json({ error: 'Nombre requerido' })
    const project = await prisma.project.create({
      data: {
        name,
        services: {
          create: serviceIds.map(serviceId => ({ serviceId: Number(serviceId) })),
        },
      },
      include: includeServices,
    })
    res.status(201).json(project)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Proyecto ya existe' })
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params
    const { name, active, serviceIds } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (active !== undefined) data.active = active

    // If serviceIds provided, replace all existing project-service relations
    if (serviceIds !== undefined) {
      await prisma.projectService.deleteMany({ where: { projectId: Number(id) } })
      data.services = {
        create: serviceIds.map(serviceId => ({ serviceId: Number(serviceId) })),
      }
    }

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data,
      include: includeServices,
    })
    res.json(project)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Proyecto no encontrado' })
    next(err)
  }
}

module.exports = { list, listAll, create, update }
