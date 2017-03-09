import test from 'ava';
import http from 'http';
import express from 'express';
import koa from 'koa';
import _ from 'lodash';
import request from 'request-promise';
import nock from 'nock';

import Botmaster from '../../lib';
import MockBot from '../_mock_bot';
import KoaMockBot from '../_koa_mock_bot';
import config from '../_config';
