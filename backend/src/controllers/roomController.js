import Room from '../models/roomModel.js';
import { importRoomsFromExcel } from '../services/importExportService.js';
import fs from 'fs';

const getRooms = async (req, res, next) => {
  try {
    const { type, building, search } = req.query;
    const query = {};

    if (type && type !== 'all') query.type = type;
    if (building && building !== 'all') query.building = building;
    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } },
      ];
    }

    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    await room.deleteOne();
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const bulkUploadRooms = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    }
    const { importedCount, errors } = await importRoomsFromExcel(req.file.path);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(200).json({
      success: true,
      importedCount,
      errors,
      message: `Successfully imported/updated ${importedCount} rooms from Excel!`,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, bulkUploadRooms };
