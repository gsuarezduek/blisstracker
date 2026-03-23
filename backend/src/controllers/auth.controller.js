const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

async function me(req, res) {
  res.json(req.user)
}

module.exports = { login, me }
