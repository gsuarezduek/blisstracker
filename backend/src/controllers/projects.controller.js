const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function list(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    })
    res.json(projects)
  } catch (err) { next(err) }
}

async function listAll(req, res, next) {
  try {
    const projects = await prisma.project.findMany({ orderBy: { name: 'asc' } })
    res.json(projects)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Nombre requerido' })
    const project = await prisma.project.create({ data: { name } })
    res.status(201).json(project)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Proyecto ya existe' })
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params
    const { name, active } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (active !== undefined) data.active = active
    const project = await prisma.project.update({ where: { id: Number(id) }, data })
    res.json(project)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Proyecto no encontrado' })
    next(err)
  }
}

module.exports = { list, listAll, create, update }
