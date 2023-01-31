import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Page,
  Pageable,
  Searchable,
  SortableProcessor,
} from 'src/v1/common/common.api';
import { type SearchableQueryDto } from 'src/v1/common/common.dto';
import { ServiceException } from 'src/v1/common/common.exception';
import { assign } from 'src/v1/common/common.object';
import { Review, ReviewState } from 'src/v1/database/entities/review.entity';
import { type User } from 'src/v1/database/entities/user.entity';
import { Logger, SystemLogger } from 'src/v1/logger/logger.core';
import { TelegramService } from 'src/v1/telegram/telegram.service';
import { Equal, Repository } from 'typeorm';
import { CourseService } from '../course.service';
import { type CreateReviewDto } from './dto/create-review.dto';
import { CourseReviewDto } from './dto/review-item.dto';
import { ReviewDto } from './dto/review.dto';
import { type UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  @Logger()
  private readonly logger: SystemLogger;

  constructor (
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly courseService: CourseService,
    private readonly telegramService: TelegramService
  ) {}

  private readonly reviewSortableProcessor = SortableProcessor.of<Review>(
    { rating: ['DESC'], date: ['DESC', 'createdAt'] },
    'date'
  ).fallback('id', 'ASC');

  async getReview (id: string, relations?: string[]): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations,
    });

    if (review == null) {
      throw ServiceException.create(HttpStatus.NOT_FOUND, {
        message: 'Review with given id not found',
      });
    }

    return review;
  }

  async getReviews (
    link: string,
    query: SearchableQueryDto
  ): Promise<Page<CourseReviewDto>> {
    const course = await this.courseService.getCourse(link);

    const [items, count] = await this.reviewRepository.findAndCount({
      ...Pageable.of(query.page, query.pageSize).toQuery(),
      where: {
        course: Equal(course),
        state: ReviewState.APPROVED,
        ...Searchable.of<Review>('content', query.searchQuery).toQuery(),
      },
      order: { ...this.reviewSortableProcessor.toQuery(query.sort) },
    });

    return Page.of(
      count,
      items.map((r) => CourseReviewDto.from(r))
    );
  }

  async updateReview (id: string, update: UpdateReviewDto): Promise<ReviewDto> {
    const review = await this.getReview(id, [
      'user',
      'course',
      'course.teacher',
      'course.subject',
    ]);
    const previousState = review.state;

    if (update.content != null) {
      review.content = update.content;
    }
    if (update.rating != null) {
      review.rating = update.rating;
    }
    if (update.state != null) {
      review.state = update.state;
    }

    if (review.state != previousState && previousState == ReviewState.PENDING) {
      if (review.state == ReviewState.APPROVED) {
        await this.reviewRepository.update(
          {
            user: Equal(review.user),
            course: Equal(review.course),
            state: ReviewState.APPROVED,
          },
          { state: ReviewState.OUTDATED }
        );

        this.telegramService.broadcastApprovedReview(review).catch((e) =>
          this.logger.error('Failed to broadcast an approved review', {
            review: review.id,
            user: review.user.id,
            error: e.toString(),
          })
        );
      } else if (review.state == ReviewState.DECLINED) {
        this.telegramService.broadcastDeclinedReview(review).catch((e) =>
          this.logger.error('Failed to broadcast a denied review', {
            user: review.user.id,
            error: e.toString(),
          })
        );
      }
    }

    return ReviewDto.from(await this.reviewRepository.save(review));
  }

  async createReview (
    link: string,
    user: User,
    dto: CreateReviewDto
  ): Promise<ReviewDto> {
    const course = await this.courseService.getCourse(link);

    const review = await this.reviewRepository.save(
      assign(new Review(), {
        course,
        user,
        rating: dto.rating,
        content: dto.content,
      })
    );

    this.telegramService.broadcastPendingReview(user, course, review).catch((e) =>
      this.logger.error('Failed to broadcast a pending review', {
        review: review.id,
        error: e.toString(),
      })
    );

    return ReviewDto.from(review);
  }

  async deleteReview (id: string): Promise<void> {
    const review = await this.getReview(id);

    await review.remove();
  }
}
