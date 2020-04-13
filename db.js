const pgp = require("pg-promise")();

const cn = {
  host: "localhost",
  port: 5432,
  database: "passport_db",
  user: "admin",
  password: "1235",
};

const db = pgp(cn); // database instance;

const dbDriver = {
  getUser({ username, password }) {
    return db.one(
      `SELECT * FROM public."user" WHERE login = $1 and password = $2`,
      [username, password]
    );
  },
  getUserById({ id }) {
    return db.any(`SELECT * FROM public."user" WHERE id = $1`, [id]);
  },
  getUserFields({ id }) {
    return db.any(
      `SELECT * FROM public."user_data_map" JOIN public."user_data_values" ON public."user_data_map".id = public."user_data_values".user_data_id WHERE user_id = $1`,
      [id]
    );
  },
  async setUserValue({ value, field, user }) {
    const userVals = await this.getUserFields({ id: user });
    if (userVals.find((v) => v.type_id === field)) {
      const data = await db.any(
        "SELECT * FROM public.user_data_values JOIN public.user_data_map ON public.user_data_map.id = public.user_data_values.user_data_id WHERE user_id = $1 and type_id = $2",
        [user, field]
      );
      const mapId = data[0].id;
      return db.any(
        `UPDATE public.user_data_values SET value = $1 WHERE user_data_id = $2 and type_id = $3`,
        [value, mapId, field]
      );
    } else {
      await db.any(`INSERT INTO public.user_data_map(user_id) VALUES ($1)`, [
        user,
      ]);
      const data = await db.any(
        "SELECT * FROM public.user_data_map WHERE user_id = $1 ORDER BY id DESC",
        [user]
      );

      const mapId = data[0].id;
      return db.any(
        `INSERT INTO public.user_data_values(user_data_id, type_id, value) VALUES ($1, $2, $3);`,
        [mapId, field, value]
      );
    }
  },
  getAllFields() {
    return db.any(`SELECT * FROM public."user_data_type"`);
  },
  getService({ username, password }) {
    return db.one(
      `SELECT * FROM public."service" WHERE login = $1 and password = $2`,
      [username, password]
    );
  },
  getUserServices({ user }) {
    return db.any(
      `SELECT * FROM public.service
      JOIN public.service_user_data ON public.service_user_data.service_id = public.service.id
      JOIN public.user_data_map ON public.user_data_map.id = public.service_user_data.user_data_id
      WHERE public.user_data_map.user_id = $1`,
      [user]
    );
  },
  getServiceById({ id }) {
    return db.any(`SELECT * FROM public."service" WHERE id = $1`, [id]);
  },
  getServices() {
    return db.any(`SELECT * FROM public."service"`);
  },
  async assignService({ service, user }) {
    const required_permisssions = await db.any(
      `SELECT * FROM public.service_permissions WHERE service_id = $1`,
      [service]
    );
    const fields = await db.any(
      `SELECT public.user_data_map.id as map_id, public.user_data_type.data_group_id
      FROM public.user_data_values
      JOIN public.user_data_map  ON public.user_data_map.id = public.user_data_values.user_data_id 
      JOIN public.user_data_type ON public.user_data_type.id = public.user_data_values.type_id
      WHERE public.user_data_map.user_id = $1`,
      [user]
    );

    const res_fields = fields.filter((f) =>
      required_permisssions.find((p) => p.group_id === f.data_group_id)
    );

    return res_fields.forEach(async (r) => {
      await db.any(
        `INSERT INTO public.service_user_data(service_id, user_data_id) VALUES ($1, $2);`,
        [service, r.map_id]
      );
    });
  },
  async deleteService({ service, user }) {
    const data = await db.any(
      `SELECT * FROM public.service_user_data JOIN public.user_data_map ON public.user_data_map.id = public.service_user_data.user_data_id WHERE public.user_data_map.user_id = $1 and public.service_user_data.service_id = $2;`,
      [user, service.service_id]
    );
    if (!data.length) return -1;

    const id = data[0].id;
    await db.any(
      `DELETE FROM public.service_user_data WHERE public.service_user_data.user_data_id = $1 and public.service_user_data.service_id = $2;`,
      [id, service.service_id]
    );
    return 0;
  },
  getAllDataGroups() {
    return db.any(`SELECT * FROM public.user_data_type_group;`);
  },
  getServicePermissions({ service }) {
    return db.any(
      `SELECT * FROM public.service_permissions WHERE public.service_permissions.service_id = $1;`,
      [service]
    );
  },
  async getServiceUsers({ service }) {
    const maps = await db.any(
      `SELECT * FROM public.service_user_data WHERE public.service_user_data.service_id = $1`,
      [service]
    );
    const ids = maps.map((m) => m.user_data_id);

    const raw_data = await Promise.all(
      ids.map(async (id) => {
        return await db.any(
          "SELECT public.user_data_type.type_code, public.user_data_values.value FROM public.user_data_values JOIN public.user_data_type ON public.user_data_type.id = public.user_data_values.type_id WHERE user_data_id = $1",
          [id]
        );
      })
    );

    return raw_data;
  },
  async setServicePermissions({ service, data }) {
    await db.any(
      "DELETE FROM public.service_permissions WHERE service_id = $1;",
      [service]
    );

    return await Promise.all(
      data.map(async (d) => {
        return (
          d.value &&
          (await db.any(
            `INSERT INTO public.service_permissions(service_id, group_id) VALUES ($1, $2);`,
            [service, d.id]
          ))
        );
      })
    );
  },
};

module.exports = dbDriver;
