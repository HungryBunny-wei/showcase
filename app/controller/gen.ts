import {Controller} from 'egg';
import * as fs from 'fs';
import * as path from 'path';
import {File} from '../entity/file';
import {ErrorService} from '../lib/error/error.service';

const pump = require('mz-modules/pump');

export default class GenController extends Controller {
  async form() {
    await this.ctx.render('page/form.html');
  }

  async multiple() {
    await this.ctx.render('page/multiple.html');
  }

  async upload() {
    const stream = await this.ctx.getFileStream();
    const uuid = this.ctx.uuid();
    const filename = stream.filename;
    const uid = uuid + path.extname(filename).toLowerCase();
    const filePath = 'app/public/upload/' + uid;
    const target = path.join(this.config.baseDir, filePath);
    const writeStream = fs.createWriteStream(target);
    await pump(stream, writeStream);
    const file = new File();
    const fileRepo = this.ctx.app.typeorm.getRepository(File);
    file.uid = uid;
    file.Filename = filename;
    file.FilePath = filePath;
    await fileRepo.save(file);
    this.ctx.body = {
      success: true,
      obj: file,
    };
    // this.ctx.redirect('/api/public/' + filename);
  }

  async uploads() {
    const parts = this.ctx.multipart({autoFields: true});
    const result: File[] = [];
    let stream = await parts();
    while (stream != null) {
      const uuid = this.ctx.uuid();
      const filename = stream.filename;
      const uid = uuid + path.extname(filename).toLowerCase();
      const filePath = 'app/public/upload/' + uid;
      const target = path.join(this.config.baseDir, filePath);
      const writeStream = fs.createWriteStream(target);
      await pump(stream, writeStream);

      const file = new File();
      const fileRepo = this.ctx.app.typeorm.getRepository(File);
      file.uid = uid;
      file.Filename = filename;
      file.FilePath = filePath;
      await fileRepo.save(file);
      result.push(file);
      stream = await parts();
    }
    this.ctx.body = {
      success: true,
      obj: result,
    };
    // await this.ctx.render('page/multiple_result.html', {
    //   fields: Object.keys(parts.field).map(key => ({key, value: parts.field[key]})),
    //   files,
    // });
  }

  async getFile() {
    let uid;
    if (this.ctx.method.toLowerCase() === 'post'.toLowerCase()) {
      uid = this.ctx.request.body.uid;
    } else {
      uid = this.ctx.request.query.uid;
    }
    if (!uid) {
      throw ErrorService.RuntimeError('sys.notFind');
    }
    const fileRepo = this.ctx.app.typeorm.getRepository(File);
    const file = await fileRepo.findOne({
      where: {
        uid,
      },
    });
    if (file) {
      this.ctx.body = fs.createReadStream(path.join(this.app.config.baseDir, file.FilePath));
    } else {
      throw ErrorService.RuntimeError('sys.notFind');
    }
  }
}
